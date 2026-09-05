import Tooltip from "../utils/tooltip";

interface StarRatingProps {
  rating?: number;
  className?: string;
}

const delays = [0, 0.22, 0.51, 0.16, 0.73];
const durations = [2.8, 3.2, 2.6, 3.5, 2.9];

function Rating({
  rating = 0,
  className = "",
}: StarRatingProps) {
  const starsValue = rating / 2;
  const roundedRating = starsValue.toFixed(2);

  return (
    <div className={`relative flex items-center gap-1 group ${className}`}>
      <Tooltip>{roundedRating}/5</Tooltip>

      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fill = Math.max(
          0,
          Math.min(100, (starsValue - (starIndex - 1)) * 100)
        );

        return (
          <div
            key={starIndex}
            className="relative w-6 h-6 balatro-star"
            style={{
              animationDelay: `${delays[starIndex - 1]}s`,
              animationDuration: `${durations[starIndex - 1]}s`,
            }}
          >
            {/* Étoile vide */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 size-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>

            {/* Remplissage */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Rating;