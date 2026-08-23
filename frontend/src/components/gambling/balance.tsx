type BalanceProps = {
  balance: number;
};

export function Balance({
  balance,
}: BalanceProps) {
  return (
    <div className="flex bg-byellow rounded-2xl w-full h-full p-3 card justify-center items-center">
      <span className="mr-2">Balance :</span>

      <p className="font-extrabold text-2xl ">
        {balance} $
      </p>

    </div>
  );
}