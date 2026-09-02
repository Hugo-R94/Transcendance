import { useTranslation } from "react-i18next";

type BalanceProps = {
  balance: number;
};

export function Balance({
  balance,
}: BalanceProps) {
  const { t } = useTranslation();

  return (
    <div className="flex bg-byellow rounded-2xl w-full h-full p-3 card justify-center items-center">
      <span className="mr-2">{t("balance.label")}</span>

      <p className="font-extrabold text-2xl ">
        {balance} $
      </p>

    </div>
  );
}