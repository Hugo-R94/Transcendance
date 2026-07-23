import { useState } from "react";

interface StarRatingProps {
  /** La note actuelle sur 10 (ex: 5 -> 2.5 étoiles, 6 -> 3 étoiles, 6.8 -> 3.5 étoiles) */
  rating?: number;
  /** Callback appelée quand l'utilisateur clique (renvoie une note de 1 à 10) */
  onChange?: (rating10: number) => void;
  /** Mode lecture seule pour désactiver l'interactivité */
  readOnly?: boolean;
  className?: string;
}

const delays = [0, 0.22, 0.51, 0.16, 0.73];
const durations = [2.8, 3.2, 2.6, 3.5, 2.9];

function Rating({
  rating = 0,
  onChange,
  readOnly = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // La note courante sur 10 (survolée ou enregistrée)
  const currentRating10 = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (
	e: React.MouseEvent<HTMLDivElement>,
	starIndex: number
  ) => {
	if (readOnly) return;

	const { left, width } = e.currentTarget.getBoundingClientRect();
	const mouseX = e.clientX - left;

	// Moitié gauche = -1 sur la note sur 10 (ex: étoile 3 -> 5/10 = 2.5 étoiles)
	// Moitié droite = note entière (ex: étoile 3 -> 6/10 = 3 étoiles)
	const isLeftHalf = mouseX < width / 2;

  };

  return (
	<div
	  className={`flex gap-1 items-center ${
		readOnly ? "" : "select-none"
	  } ${className}`}
	>
	  {[1, 2, 3, 4, 5].map((starIndex) => {
		const starsValue = currentRating10 / 2;

		let fill = 0;
		if (starsValue >= starIndex - 0.25) {
		  fill = 100;
		} else if (starsValue >= starIndex - 0.75) {
		  fill = 50;
		}

		return (
		  <div
			key={starIndex}
			className="relative w-6 h-6 balatro-star transition-transform"
			style={{
			  animationDelay: `${delays[starIndex - 1]}s`,
			  animationDuration: `${durations[starIndex - 1]}s`,
			}}
		  >
			{/* Étoile grise (fond) */}
			<svg
			  xmlns="http://www.w3.org/2000/svg"
			  className="absolute inset-0 size-6 text-gray-300 "
			  fill="none"
			  viewBox="0 0 24 24"
			  strokeWidth="1.5"
			  stroke="currentColor"
			>
			  <path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
			  />
			</svg>

			{/* Remplissage jaune */}
			<div
			  className="absolute inset-0 overflow-hidden transition-[width] duration-75"
			  style={{ width: `${fill}%` }}
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6 text-yellow-400"
				fill="currentColor"
				viewBox="0 0 24 24"
				strokeWidth="1.5"
				stroke="currentColor"
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