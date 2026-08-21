import type { Result } from "../../types/gambling";

type ResultsTableProps = {
  results: Result[];
  playerId: string;
};

export function ResultsTable({
  results,
  playerId,
}: ResultsTableProps) {
  if (!results.length) {
    return null;
  }

  return (
    <section>

      <h2>
        🏆 Résultats du tour
      </h2>

      <table>

        <thead>
          <tr>
            <th>Joueur</th>
            <th>Résultat</th>
            <th>Avant</th>
            <th>Gain</th>
            <th>Après</th>
          </tr>
        </thead>

        <tbody>
          {results.map(
            (result) => (
              <tr
                key={
                  result.playerId
                }
              >
                <td>
                  {result.username ??
                    result.playerId}

                  {result.playerId ===
                    playerId && (
                    <span>
                      {" "}
                      (toi)
                    </span>
                  )}
                </td>

                <td>
                  {result.result}
                </td>

                <td>
                  {
                    result.balanceBefore
                  }
                </td>

                <td>
                  {result.gain >=
                  0
                    ? "+"
                    : ""}
                  {result.gain}
                </td>

                <td>
                  {
                    result.balanceAfter
                  }
                </td>
              </tr>
            )
          )}
        </tbody>

      </table>

    </section>
  );
}