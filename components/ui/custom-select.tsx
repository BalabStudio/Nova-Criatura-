"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  style,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const isEmpty = !value;

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = Math.min((options.length + 1) * 44, 240);
    const spaceBelow = viewportHeight - rect.bottom - 8;

    const pos: React.CSSProperties = {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    };

    if (spaceBelow >= estimatedHeight || spaceBelow >= viewportHeight - rect.top) {
      pos.top = rect.bottom + 4;
    } else {
      pos.bottom = viewportHeight - rect.top + 4;
      pos.maxHeight = rect.top - 8;
    }

    setDropdownPos(pos);
  };

  const openDropdown = () => {
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={openDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDropdown();
          if (e.key === "Escape") setOpen(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "10px 32px 10px 12px",
          border: `1px solid ${open ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "8px",
          background: "var(--card)",
          color: isEmpty ? "rgba(15, 20, 25, 0.45)" : "var(--fg)",
          fontSize: "13px",
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: open
            ? "0px 0px 0px 2px rgba(12, 34, 143, 0.1)"
            : "0px 1px 2px rgba(15, 20, 25, 0.04)",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
          userSelect: "none",
          position: "relative",
          minHeight: "40px",
          outline: "none",
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isEmpty ? placeholder : selectedLabel}
        </span>
        <svg
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 150ms ease",
            flexShrink: 0,
            pointerEvents: "none",
          }}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="#0f1419"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            ref={dropdownRef}
            role="listbox"
            style={{
              ...dropdownPos,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow:
                "0px 10px 15px -3px rgba(15, 20, 25, 0.1), 0px 4px 6px -4px rgba(15, 20, 25, 0.06)",
              overflowY: "auto",
              maxHeight: (dropdownPos.maxHeight as number) || 240,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              role="option"
              aria-selected={isEmpty}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              style={{
                padding: "11px 14px",
                fontSize: "14px",
                cursor: "pointer",
                color: isEmpty ? "var(--primary)" : "rgba(15, 20, 25, 0.45)",
                fontWeight: isEmpty ? 600 : 400,
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: "44px",
                borderBottom: "1px solid var(--border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(12,34,143,0.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {isEmpty ? (
                <CheckIcon />
              ) : (
                <span style={{ width: 14, flexShrink: 0 }} />
              )}
              {placeholder}
            </div>

            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{
                    padding: "11px 14px",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: selected ? "var(--primary)" : "var(--fg)",
                    fontWeight: selected ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: "44px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(12,34,143,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {selected ? (
                    <CheckIcon />
                  ) : (
                    <span style={{ width: 14, flexShrink: 0 }} />
                  )}
                  {opt.label}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M1 5L5 9L13 1"
        stroke="#0c228f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
