import type { Result } from "../../types/gambling";

type MyResultProps = {
  result: Result | null;
};

export function MyResult({
  result,
}: MyResultProps) {
  if (!result) {
    return null;
  }

  return (
    <section>

      <h2>
        Mon résultat
      </h2>

      <div>
        <span>
          Résultat
        </span>

        <strong>
          {result.result}
        </strong>
      </div>

      <div>
        <span>
          Solde avant
        </span>

        <strong>
          {result.balanceBefore}
        </strong>
      </div>

      <div>
        <span>
          Gain
        </span>

        <strong>
          {result.gain >= 0
            ? "+"
            : ""}
          {result.gain}
        </strong>
      </div>

      <div>
        <span>
          Solde après
        </span>

        <strong>
          {result.balanceAfter}
        </strong>
      </div>

    </section>
  );
}