---
name: Talib Club
description: เว็บไซต์วิชาการอิสลามที่สบายตาและน่าเข้า
colors:
  primary: "#0f6e56"
  primary-dark: "#2dbea0"
  neutral-bg: "#f7f5f1"
  neutral-bg-dark: "#0a0a0d"
  text: "#111010"
  text-dark: "#f0ede8"
  accent: "#1a1916"
  accent-dark: "#e8e0d0"
typography:
  display:
    fontFamily: "Prompt, sans-serif"
    fontSize: "clamp(24px, 5vw, 38px)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Prompt, sans-serif"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.8
rounded:
  sm: "4px"
  md: "12px"
  lg: "20px"
  full: "24px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "9px 20px"
  button-primary-hover:
    opacity: 0.8
  card-default:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Talib Club

## 1. Overview

**Creative North Star: "The Academic Sanctuary" (ห้องสมุดวิชาการแห่งความสงบทางปัญญา)**

การออกแบบเว็บไซต์ Talib Club มุ่งเน้นไปที่ความน่าเชื่อถือทางวิชาการ (Academic Trust) ควบคู่กับความสบายตาขณะอ่านข้อมูลหรือศึกษาค้นคว้า (Reading Comfort) ระบบการดีไซน์จึงปฏิเสธสีสันที่ฉูดฉาดเกินจำเป็น การจัดวางที่หนาแน่น และความซับซ้อนที่ไม่เอื้อต่อการอ่าน และเลือกใช้พื้นที่ว่าง (Whitespace) ที่เหมาะสม การจัดแบ่งสัดส่วนที่ชัดเจน และโทนสีธรรมชาติที่นุ่มนวล

**Key Characteristics:**
- **Reading-centric Typography**: ใช้ฟอนต์ Prompt ที่มีน้ำหนักบางเบา (Light 300) สำหรับข้อความยาว เพื่อให้อ่านง่าย สบายตา
- **Organic & Muted Palette**: สีหลักนำโดยสีเขียวปราชญ์ (Sage Teal) และสีพื้นหลังโทนกระดาษถนอมสายตา (Alabaster Paper)
- **Restrained Elevation**: ใช้ขอบเส้นบางเฉียบ (0.5px) และแสงเงาแบบกระจายตัวเบาบางแทนการยกกล่องแบบลอยตัวหนา

## 2. Colors

สีสันของระบบออกแบบเน้นความสบายตาและลดการล้าของสายตาเป็นหลัก

### Primary
- **Academic Emerald/Sage Teal** (`#0f6e56` สำหรับ Light Mode / `#2dbea0` สำหรับ Dark Mode): เป็นสีหลักที่ใช้แสดงถึงความเป็นวิชาการ ความรู้ และความเยือกเย็น ใช้สำหรับจุดเน้นหลัก ปุ่มสำคัญ และ badges บ่งบอกความก้าวหน้า

### Neutral
- **Alabaster Paper** (`#f7f5f1` สำหรับ Light Mode / `#0a0a0d` สำหรับ Dark Mode): สีพื้นหลังที่นุ่มนวลกว่าสีขาวบริสุทธิ์เพื่อถนอมสายตา
- **Charcoal Ink** (`#111010` สำหรับ Light Mode / `#f0ede8` สำหรับ Dark Mode): สีข้อความหลักที่ให้ค่าคอนทราสต์เหมาะสมในการอ่านยาวๆ (ความเปรียบต่างสูงแต่ไม่บาดตา)
- **Clay Border** (rgba ของสีดำ/สีขาวตามความเปรียบต่าง): เส้นขอบหนาเพียง 0.5px เพื่อแบ่งโซนเนื้อหาโดยไม่สร้างเส้นแบ่งทางสายตาที่เข้มเกินไป

### Named Rules
**The Restrained Teal Rule.** สีเขียววิชาการ (Teal) จะถูกใช้อย่างประหยัดในแต่ละหน้าจอ (ไม่เกิน 10% ของพื้นที่หน้าทั้งหมด) เพื่อคงความเป็นป้ายบอกความสำคัญและรักษาความสงบสายตาของอินเทอร์เฟซ

## 3. Typography

**Display Font:** Prompt (Sans-serif)
**Body Font:** Prompt (Sans-serif)
**Label/Mono Font:** ui-monospace, SFMono-Regular, Consolas, monospace

**Character:** การใช้ Prompt ในน้ำหนักที่ต่างกัน (300 ถึง 600) ให้ความรู้สึกเป็นทางการแบบสมัยใหม่ เข้าถึงง่ายแต่เต็มไปด้วยเนื้อหาที่เรียบร้อยและเป็นระเบียบ

### Hierarchy
- **Display** (Bold 600, 24px ถึง 38px, line-height 1.2): ใช้สำหรับหัวข้อหน้าหลักหรือชื่อบทความที่ต้องการเน้น
- **Headline** (Medium 500, 20px ถึง 22px, line-height 1.3): หัวข้อย่อยหลักของส่วนต่างๆ
- **Title** (Medium 500, 15px ถึง 16px, line-height 1.4): หัวข้อการ์ดหรือหัวข้อขนาดเล็ก
- **Body** (Light 300, 14px ถึง 15px, line-height 1.8): ใช้สำหรับข้อความทั่วไปและบทความ กำหนดความกว้างของแถวให้อยู่ระหว่าง 65–75 ตัวอักษร (65–75ch) เพื่อให้อ่านสบายที่สุด
- **Label** (Regular 400, 10px ถึง 12px, letter-spacing 0.05em): ใช้สำหรับป้ายกำกับ วันที่ หรือข้อมูลเสริมขนาดเล็ก

### Named Rules
**The Line-Height Sanctuary Rule.** ห้ามใช้ line-height น้อยกว่า 1.8 สำหรับข้อความส่วนที่เป็นบทความ (Body text) เพื่อป้องกันการซ้อนเบียดของตัวอักษรภาษาไทยที่มีสระบน-ล่าง

## 4. Elevation

อินเทอร์เฟซเน้นความแบนเรียบและแบ่งส่วนด้วยขอบบาง (Tonal Border Layering) หลีกเลี่ยงเงาหนาทึบยกตัวสูง

### Shadow Vocabulary
- **Ambient Card Glow** (`0 4px 16px rgba(0,0,0,0.03)`): ใช้สำหรับหน้าการ์ดปกติเพื่อให้กล่องเนื้อหาดูกลืนเป็นธรรมชาติกับพื้นหลัง
- **Active Card Elevation** (`0 6px 20px rgba(0,0,0,0.05)`): ใช้เมื่อเมาส์ชี้ผ่านการ์ด (Hover) เพื่อให้ตอบสนองต่อผู้ใช้เล็กน้อย

### Named Rules
**The Border Over Shadow Rule.** การแบ่งองค์ประกอบจะเน้นการใช้ขอบเส้นขนาด 0.5px (`var(--br)`) เป็นหลัก ห้ามใช้แสงเงาเป็นองค์ประกอบหลักในการแบ่งแยกการ์ดหากไม่ได้รับการโต้ตอบจากผู้ใช้ (Hover)

## 5. Components

### Buttons
- **Shape:** ทรงมนเต็ม (Border Radius 24px)
- **Primary:** สีเขียววิชาการตัดกับพื้นสีขาว หรือสี Charcoal ink สำหรับปุ่มสลับธีม/ปุ่มปกติ
- **Hover:** ลดความโปร่งแสงลงเล็กน้อย (Opacity 0.8) พร้อมเอฟเฟกต์การเคลื่อนไหวที่นุ่มนวล

### Chips / Tags
- **Style:** พื้นหลังสีจางจากกลุ่มสี Teal-bg (`rgba(15,110,86, 0.07)`) ตัวอักษรสีเขียวเจาะจง หรือพื้นหลังสีครีมบางสำหรับการจัดหมวดทั่วไป
- **Corner Style:** ทรงขอบมนสูง (Border Radius 20px หรือ 4px สำหรับแท็กย่อยพิเศษ)

### Cards / Containers
- **Corner Style:** ขอบมนสอดคล้องกับขนาดตัวการ์ด (Border Radius 12px ถึง 16px)
- **Background:** พื้นสีขาวสะอาดสำหรับ Light mode และกระจกมืดโปร่งแสง 3% สำหรับ Dark mode
- **Border:** เส้นขอบสีบางพิเศษ (`var(--br2)`) เพื่อรักษาขอบเขตอย่างนุ่มนวล

### Inputs / Fields
- **Style:** กล่องมน 8px พื้นสีทึบจาง มีเส้นขอบจางล้อมรอบ
- **Focus:** เปลี่ยนสีเส้นขอบเป็นสีเน้น (`var(--acc-br)`) เพื่อความเด่นชัด

### Navigation
- **Style:** แถบติดด้านบน (Sticky Navbar) มีความโปร่งแสงบางส่วน (Backdrop Filter blur 14px) เพื่อให้เห็นการเคลื่อนไหวของเนื้อหาด้านล่างอย่างนุ่มนวลขณะเลื่อนหน้าจอ

## 6. Do's and Don'ts

### Do:
- **Do** รักษาความกว้างของข้อความเนื้อหาบทความให้อยู่ที่ความกว้างสูงสุดประมาณ 720px (`max-width: 720px`) และจัดให้อยู่กึ่งกลางหน้า
- **Do** ใช้ฟอนต์น้ำหนัก 300 สำหรับการแสดงผลย่อยในภาษาไทย และใช้ line-height 1.8 เสมอสำหรับเนื้อหาบทความทั่วไป
- **Do** ใช้ transition: background 0.3s, color 0.3s ในการสลับธีมมืดและสว่าง เพื่อลดความกระตุกสายตาของผู้ใช้

### Don't:
- **Don't** ใช้ gradient text กับหัวข้อวิชาการเด็ดขาด ให้ใช้สี Charcoal หรือสีขาวตรงตามธีมเพื่อความเรียบง่ายและเป็นผู้ใหญ่
- **Don't** ตกแต่งการ์ดด้วยการระบายสีขอบฝั่งซ้ายหรือขวาเป็นแถบหนาสีเข้ม (Side-stripe borders) เพราะทำให้เว็บบดบังความเป็นทางการและดูรกสายตา
- **Don't** ออกแบบการ์ดในแนวตารางที่เป็นแพทเทิร์นเดียวกันซ้ำๆ ทั้งหน้าโดยไม่มีการจัดอันดับหรือเน้นชิ้นงานแรก (Feature Card) ให้กับผู้ใช้
