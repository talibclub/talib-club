import { useEffect, useMemo, useState } from "react"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  browserLocalPersistence,
  EmailAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithRedirect,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase.js"

const DEFAULT_PROFILE = { role: "member", displayName: "", email: "" }
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

const POPUP_FALLBACK_CODES = new Set([
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
])

async function saveGoogleProfile(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid)
  const snap = await getDoc(ref)
  const payload = {
    role: snap.exists() ? snap.data()?.role || "member" : "member",
    displayName: firebaseUser.displayName || "",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    provider: "google",
    updatedAt: serverTimestamp(),
  }

  if (!snap.exists()) {
    payload.createdAt = serverTimestamp()
  }

  await setDoc(ref, payload, { merge: true })
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch(err => console.error("Cannot set auth persistence", err))

    getRedirectResult(auth)
      .then(res => {
        if (res?.user) return saveGoogleProfile(res.user)
        return null
      })
      .catch(err => console.error("Cannot finish Google redirect", err))

    let activeSeq = 0
    return onAuthStateChanged(auth, async currentUser => {
      const currentSeq = ++activeSeq
      setUser(currentUser)
      if (!currentUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const ref = doc(db, "users", currentUser.uid)
        const snap = await getDoc(ref)
        if (currentSeq !== activeSeq) return

        if (snap.exists()) {
          const snapData = snap.data()
          // Only update if auth data actually changed, not every render
          const email = currentUser.email || ""
          const displayName = currentUser.displayName || snapData.displayName || ""
          const photoURL = currentUser.photoURL || snapData.photoURL || ""

          const hasChanged =
            (snapData.email || "") !== email ||
            (snapData.displayName || "") !== displayName ||
            (snapData.photoURL || "") !== photoURL

          if (hasChanged) {
            // Only write if data truly changed
            await setDoc(ref, {
              email,
              displayName,
              photoURL,
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(e => console.error("Sync profile to firestore failed", e))
          }
          if (currentSeq !== activeSeq) return
          setProfile({
            ...DEFAULT_PROFILE,
            ...snapData,
            email,
            displayName,
            photoURL,
          })
        } else {
          const nextProfile = {
            role: "member",
            displayName: currentUser.displayName || "",
            email: currentUser.email || "",
            createdAt: serverTimestamp(),
          }
          await setDoc(ref, nextProfile)
          if (currentSeq !== activeSeq) return
          setProfile({ ...nextProfile, createdAt: new Date() })
        }
      } catch (err) {
        console.error("Cannot load user profile", err)
        if (currentSeq !== activeSeq) return
        setProfile({ ...DEFAULT_PROFILE, email: currentUser.email || "" })
      }
      setLoading(false)
    })
  }, [])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isStaff: profile?.role === "staff" || profile?.role === "admin" || profile?.role === "owner",
    async login(email, password) {
      return signInWithEmailAndPassword(auth, email, password)
    },
    async loginWithGoogle() {
      try {
        const res = await signInWithPopup(auth, googleProvider)
        await saveGoogleProfile(res.user)
        return res
      } catch (err) {
        if (!POPUP_FALLBACK_CODES.has(err.code)) throw err
        window.sessionStorage.setItem("talibAfterLogin", "member")
        await signInWithRedirect(auth, googleProvider)
        return { redirecting: true }
      }
    },
    async register({ email, password, displayName }) {
      const cleanEmail = email.trim().toLowerCase()
      const cleanDisplayName = displayName ? displayName.trim() : ""
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, password)
      if (cleanDisplayName) await updateProfile(res.user, { displayName: cleanDisplayName })
      await setDoc(doc(db, "users", res.user.uid), {
        role: "member",
        displayName: cleanDisplayName,
        email: cleanEmail,
        emailVerified: res.user.emailVerified,
        createdAt: serverTimestamp(),
      })
      await sendEmailVerification(res.user)
      return res
    },
    async updateUserProfile({ displayName }) {
      if (!auth.currentUser) throw new Error("Missing current user")
      const cleanDisplayName = (displayName || "").trim()
      await updateProfile(auth.currentUser, { displayName: cleanDisplayName })
      const nextProfile = {
        displayName: cleanDisplayName,
        email: auth.currentUser.email || "",
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, "users", auth.currentUser.uid), nextProfile, { merge: true })
      setProfile(prev => ({ ...DEFAULT_PROFILE, ...(prev || {}), ...nextProfile }))
    },
    async updateUserPassword(newPassword) {
      if (!auth.currentUser) throw new Error("Missing current user")
      const cleanPassword = newPassword.trim()
      if (!cleanPassword) throw new Error("Missing password")
      await updatePassword(auth.currentUser, cleanPassword)
    },
    async requestEmailChange(nextEmail) {
      if (!auth.currentUser) throw new Error("Missing current user")
      const cleanEmail = (nextEmail || "").trim().toLowerCase()
      if (!cleanEmail) throw new Error("Missing email")
      if (cleanEmail === auth.currentUser.email) throw new Error("Email is unchanged")
      await verifyBeforeUpdateEmail(auth.currentUser, cleanEmail)
    },
    async reauthenticateForSensitiveAction(password = "") {
      if (!auth.currentUser?.email) throw new Error("Missing current user")
      const providers = auth.currentUser.providerData.map(item => item.providerId)
      if (providers.includes(GoogleAuthProvider.PROVIDER_ID) && !providers.includes("password")) {
        return reauthenticateWithPopup(auth.currentUser, googleProvider)
      }

      const cleanPassword = password.trim()
      if (!cleanPassword) throw new Error("Missing password")
      const credential = EmailAuthProvider.credential(auth.currentUser.email, cleanPassword)
      return reauthenticateWithCredential(auth.currentUser, credential)
    },
    async sendCurrentEmailVerification() {
      if (!auth.currentUser) throw new Error("Missing current user")
      await sendEmailVerification(auth.currentUser)
    },
    async sendPasswordReset() {
      if (!auth.currentUser?.email) throw new Error("Missing current user email")
      await sendPasswordResetEmail(auth, auth.currentUser.email)
    },
    async sendPasswordResetForEmail(email) {
      const cleanEmail = (email || "").trim().toLowerCase()
      if (!cleanEmail) throw new Error("Missing email")
      await sendPasswordResetEmail(auth, cleanEmail)
    },
    logout() {
      return signOut(auth)
    },
  }), [user, profile, loading])

  return value
}