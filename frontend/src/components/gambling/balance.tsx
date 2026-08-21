type BalanceProps = {
  balance: number;
};

export function Balance({
  balance,
}: BalanceProps) {
  return (
    <div className="flex bg-byellow rounded-2xl w-fit h-fit p-3 card">
      <span className="mr-2">Balance :</span>

      <p className="font-extrabold ">
        {balance} $
      </p>

    </div>
  );
}