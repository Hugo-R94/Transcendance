import { useState } from "react";
import { useTranslation } from "react-i18next";

type Page = "terms" | "privacy";

const termsSections = [
  "object",
  "account",
  "behavior",
  "content",
  "gaming",
  "moderation",
  "intellectualProperty",
  "availability",
  "modifications"
] as const;

const privacySections = [
  "collection",
  "messages",
  "usage",
  "authentication",
  "localStorage",
  "external",
  "sharing",
  "deletion",
  "modifications"
] as const;

export default function TermsOfServices() {
  const { t } = useTranslation();

  const [page, setPage] = useState<Page>("terms");

  const sections =
    page === "terms"
      ? termsSections
      : privacySections;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center">

      {/* SELECTEUR */}
		<div className="flex w-full h-15 gap-x-3 mt-20 font-bold justify-center">
		<button
			onClick={() => setPage("terms")}
			className={`bg-bred w-50 h-full rounded-2xl hover:outline-3
			hover:outline-white ${
				page === "terms" ? "outline-3 outline-white" : ""
			}`}
		>
			{t("navbar.dropdown.terms")}
		</button>

		<button
			onClick={() => setPage("privacy")}
			className={`bg-byellow w-50 h-full rounded-2xl
			hover:outline-3 hover:outline-white ${
				page === "privacy" ? "outline-3 outline-white" : ""
			}`}
		>
			{t("privacy.title")}
		</button>
		</div>


      {/* CONTENU */}
      <div className="bg-bdarkgreen w-[90%] p-5 h-[75vh] mx-auto mt-5 rounded-2xl card">

        <div className="w-full h-full bg-black/50 rounded-2xl overflow-auto p-5">

          <h1 className="text-3xl font-bold mb-4">
            {t(`${page}.title`)}
          </h1>

          {sections.map((section) => (
            <section
              key={section}
              className="mb-5"
            >
              <h2 className="font-semibold text-lg mb-1">
                {t(`${page}.${section}.title`)}
              </h2>

              <p className="opacity-90 text-sm leading-relaxed">
                {t(`${page}.${section}.description`)}
              </p>
            </section>
          ))}

        </div>

      </div>
    </div>
  );
}
