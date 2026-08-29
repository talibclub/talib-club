import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, SlidersHorizontal, Loader2, X, ArrowRight } from 'lucide-react';
import { HW } from './theme.js';

/**
 * Floating toolbar & Quick-Jump navigator for PDF widgets in ProNotebook.
 * Supports:
 * - Direct page number typing (e.g. type "300" -> Enter to jump instantly)
 * - Stepper buttons (<, >, <<, >>)
 * - Quick jump popover with Range Slider (scrubbing across 500+ pages)
 * - Quick milestone jumps (1st page, 25%, 50% midpoint, 75%, last page, ±10, ±50)
 * - Responsive, frosted-glass layout that prevents awkward text breaking
 */
export default function PdfWidgetControls({
  pdf,
  pageX,
  pageY,
  scale,
  position,
  onPageChange,
  isLoading = false,
}) {
  const [pageInput, setPageInput] = useState(String(pdf.currentPage || 1));
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [sliderVal, setSliderVal] = useState(pdf.currentPage || 1);
  const [popoverInput, setPopoverInput] = useState(String(pdf.currentPage || 1));
  const popoverRef = useRef(null);

  // Sync state with current PDF page
  useEffect(() => {
    setPageInput(String(pdf.currentPage || 1));
    setSliderVal(pdf.currentPage || 1);
    setPopoverInput(String(pdf.currentPage || 1));
  }, [pdf.currentPage]);

  // Handle jump logic
  const handleJump = (targetPage) => {
    const parsed = parseInt(targetPage, 10);
    if (isNaN(parsed)) {
      setPageInput(String(pdf.currentPage || 1));
      return;
    }
    const clamped = Math.max(1, Math.min(pdf.numPages || 1, parsed));
    setPageInput(String(clamped));
    setSliderVal(clamped);
    setPopoverInput(String(clamped));
    if (clamped !== pdf.currentPage) {
      onPageChange(clamped);
    }
  };

  // Close quick jump on outside click
  useEffect(() => {
    if (!showQuickJump) return;
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowQuickJump(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, [showQuickJump]);

  const x = (pdf.x + pageX) * scale + position.x;
  const y = (pdf.y + pageY) * scale + position.y;
  const screenWidth = Math.max(280, pdf.width * scale);

  const numPages = pdf.numPages || 1;
  const currPage = pdf.currentPage || 1;

  // Milestone pages for fast jumping
  const midPage = Math.round(numPages / 2);
  const q1Page = Math.max(1, Math.round(numPages * 0.25));
  const q3Page = Math.min(numPages, Math.round(numPages * 0.75));

  return (
    <div
      key={pdf.id}
      style={{
        position: 'absolute',
        top: Math.max(8, y - 46),
        left: x,
        width: screenWidth,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={popoverRef}
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Main Floating Capsule Toolbar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(16px)',
            WebkitBackdropFilter: 'saturate(180%) blur(16px)',
            borderRadius: 999,
            padding: '3px 6px 3px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(15, 110, 86, 0.18)',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {/* File Icon & Name */}
          <div
            title={pdf.fileName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              paddingRight: 4,
              maxWidth: 140,
              minWidth: 0,
            }}
          >
            <FileText size={15} color="#EF4444" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: '#1F2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'Kanit, sans-serif',
              }}
            >
              {pdf.fileName}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'rgba(0, 0, 0, 0.1)' }} />

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* First Page (<<) if more than 10 pages */}
            {numPages > 10 && (
              <button
                onClick={() => handleJump(1)}
                disabled={currPage <= 1 || isLoading}
                title="หน้าแรก (หน้า 1)"
                aria-label="หน้าแรก"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: currPage <= 1 || isLoading ? 'default' : 'pointer',
                  opacity: currPage <= 1 || isLoading ? 0.25 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: HW.accent,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (currPage > 1 && !isLoading) e.currentTarget.style.background = 'rgba(15,110,86,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ChevronsLeft size={15} strokeWidth={2.2} />
              </button>
            )}

            {/* Previous Page (<) */}
            <button
              onClick={() => handleJump(currPage - 1)}
              disabled={currPage <= 1 || isLoading}
              title="หน้าก่อนหน้า"
              aria-label="หน้าก่อนหน้า"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                cursor: currPage <= 1 || isLoading ? 'default' : 'pointer',
                opacity: currPage <= 1 || isLoading ? 0.25 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: HW.accent,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (currPage > 1 && !isLoading) e.currentTarget.style.background = 'rgba(15,110,86,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ChevronLeft size={16} strokeWidth={2.2} />
            </button>

            {/* Editable Page Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(15, 110, 86, 0.05)',
                borderRadius: 999,
                padding: '2px 6px',
                border: '1px solid rgba(15, 110, 86, 0.15)',
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                disabled={isLoading}
                onChange={(e) => setPageInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJump(pageInput);
                    e.currentTarget.blur();
                  }
                }}
                onBlur={() => handleJump(pageInput)}
                style={{
                  width: `${Math.max(28, String(numPages).length * 8.5 + 10)}px`,
                  height: 22,
                  padding: '0 2px',
                  borderRadius: 999,
                  border: '1px solid rgba(15, 110, 86, 0.25)',
                  background: 'white',
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: HW.accent,
                  outline: 'none',
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'Kanit, sans-serif',
                }}
                title="พิมพ์เลขหน้าแล้วกด Enter เพื่อไปยังหน้านั้นทันที"
                aria-label="พิมพ์เลขหน้าที่ต้องการ"
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6B7280',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  paddingRight: 2,
                }}
              >
                / {numPages}
              </span>
            </div>

            {/* Next Page (>) */}
            <button
              onClick={() => handleJump(currPage + 1)}
              disabled={currPage >= numPages || isLoading}
              title="หน้าถัดไป"
              aria-label="หน้าถัดไป"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                cursor: currPage >= numPages || isLoading ? 'default' : 'pointer',
                opacity: currPage >= numPages || isLoading ? 0.25 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: HW.accent,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (currPage < numPages && !isLoading) e.currentTarget.style.background = 'rgba(15,110,86,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>

            {/* Last Page (>>) if more than 10 pages */}
            {numPages > 10 && (
              <button
                onClick={() => handleJump(numPages)}
                disabled={currPage >= numPages || isLoading}
                title={`หน้าสุดท้าย (หน้า ${numPages})`}
                aria-label="หน้าสุดท้าย"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: currPage >= numPages || isLoading ? 'default' : 'pointer',
                  opacity: currPage >= numPages || isLoading ? 0.25 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: HW.accent,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (currPage < numPages && !isLoading) e.currentTarget.style.background = 'rgba(15,110,86,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ChevronsRight size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'rgba(0, 0, 0, 0.1)' }} />

          {/* Quick Jump / Slider Launcher Button */}
          <button
            onClick={() => setShowQuickJump((v) => !v)}
            title="เลือกหน้าด่วน / สไลเดอร์เลือกหน้า (Jump to page)"
            aria-label="เลือกหน้าด่วน"
            style={{
              height: 26,
              padding: '0 8px',
              borderRadius: 999,
              border: showQuickJump ? '1px solid rgba(15,110,86,0.4)' : '1px solid rgba(15,110,86,0.15)',
              background: showQuickJump ? HW.accentSoft : 'rgba(15,110,86,0.06)',
              color: HW.accent,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: 'Kanit, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            {isLoading ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <SlidersHorizontal size={13} strokeWidth={2.2} />
            )}
            <span>ข้ามหน้า</span>
          </button>
        </div>

        {/* Quick Jump & Scrubbing Slider Popover */}
        {showQuickJump && (
          <div
            className="cute-pop-in"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              zIndex: 50,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'saturate(200%) blur(24px)',
              WebkitBackdropFilter: 'saturate(200%) blur(24px)',
              borderRadius: 18,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(15, 110, 86, 0.1)',
              border: '1px solid rgba(15, 110, 86, 0.16)',
              padding: 14,
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontFamily: 'Kanit, sans-serif',
            }}
          >
            {/* Popover Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: HW.accentSoft,
                    color: HW.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SlidersHorizontal size={13} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                  ไปยังหน้าที่ต้องการ
                </span>
              </div>
              <button
                onClick={() => setShowQuickJump(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Range Slider for Smooth Scrubbing */}
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '10px 12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                  เลื่อนเพื่อเลือกหน้า
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: HW.accent,
                    background: HW.accentSoft,
                    padding: '1px 8px',
                    borderRadius: 999,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  หน้า {sliderVal} / {numPages} ({Math.round((sliderVal / numPages) * 100)}%)
                </span>
              </div>

              <input
                type="range"
                min="1"
                max={numPages}
                value={sliderVal}
                onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
                onMouseUp={() => handleJump(sliderVal)}
                onTouchEnd={() => handleJump(sliderVal)}
                style={{
                  width: '100%',
                  accentColor: HW.accent,
                  cursor: 'pointer',
                  margin: '4px 0 8px 0',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#9CA3AF', fontWeight: 600 }}>
                <span>หน้า 1</span>
                <span>หน้า {midPage} (50%)</span>
                <span>หน้า {numPages}</span>
              </div>

              {sliderVal !== currPage && (
                <button
                  onClick={() => {
                    handleJump(sliderVal);
                    setShowQuickJump(false);
                  }}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '6px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: HW.accent,
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(15,110,86,0.2)',
                  }}
                >
                  <span>ไปหน้า {sliderVal}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Direct Input Jump Box */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`ระบุหน้า (1-${numPages})`}
                  value={popoverInput}
                  onChange={(e) => setPopoverInput(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJump(popoverInput);
                      setShowQuickJump(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    padding: '0 10px',
                    fontSize: 12.5,
                    fontFamily: 'Kanit, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#FFFFFF',
                  }}
                />
              </div>
              <button
                onClick={() => {
                  handleJump(popoverInput);
                  setShowQuickJump(false);
                }}
                style={{
                  height: 34,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: HW.accent,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                  fontFamily: 'Kanit, sans-serif',
                }}
              >
                <span>ไป</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Fast Jump Step Buttons */}
            {numPages >= 20 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                  ข้ามทีละขั้น:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {[
                    { label: '-50', delta: -50 },
                    { label: '-10', delta: -10 },
                    { label: '+10', delta: 10 },
                    { label: '+50', delta: 50 },
                  ].map((btn) => {
                    const target = currPage + btn.delta;
                    const disabled = target < 1 || target > numPages;
                    return (
                      <button
                        key={btn.label}
                        disabled={disabled || isLoading}
                        onClick={() => {
                          handleJump(target);
                        }}
                        style={{
                          padding: '5px 0',
                          borderRadius: 8,
                          border: '1px solid #E5E7EB',
                          background: disabled ? '#F3F4F6' : '#FFFFFF',
                          color: disabled ? '#9CA3AF' : '#374151',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: disabled ? 'default' : 'pointer',
                          fontVariantNumeric: 'tabular-nums',
                          fontFamily: 'Kanit, sans-serif',
                        }}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestone Jump Buttons */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                จุดสำคัญของเล่ม:
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { label: 'หน้าแรก (1)', page: 1 },
                  ...(numPages >= 40 ? [{ label: `25% (${q1Page})`, page: q1Page }] : []),
                  { label: `กลางเล่ม (${midPage})`, page: midPage },
                  ...(numPages >= 40 ? [{ label: `75% (${q3Page})`, page: q3Page }] : []),
                  { label: `หน้าท้าย (${numPages})`, page: numPages },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      handleJump(item.page);
                      setShowQuickJump(false);
                    }}
                    style={{
                      flex: '1 1 auto',
                      padding: '5px 8px',
                      borderRadius: 8,
                      border: '1px solid rgba(15,110,86,0.15)',
                      background: item.page === currPage ? HW.accentSoft : '#F9FAFB',
                      color: item.page === currPage ? HW.accent : '#374151',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Kanit, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
