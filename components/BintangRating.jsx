import { IconStar, IconStarFilled } from "@tabler/icons-react";

export default function BintangRating({
  nilai = 0,
  size = 16,
  className = "",
  ariaLabel,
}) {
  const bintang = Math.max(0, Math.min(5, Math.round(Number(nilai) || 0)));

  return (
    <span
      role="img"
      aria-label={ariaLabel || `${bintang} dari 5 bintang`}
      className={`inline-flex items-center gap-0.5 ${className}`.trim()}
    >
      {[1, 2, 3, 4, 5].map((urutan) =>
        urutan <= bintang ? (
          <IconStarFilled
            key={urutan}
            size={size}
            aria-hidden="true"
            className="text-accent"
          />
        ) : (
          <IconStar
            key={urutan}
            size={size}
            stroke={1.8}
            aria-hidden="true"
            className="text-border"
          />
        )
      )}
    </span>
  );
}
