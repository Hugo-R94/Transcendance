import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBar from "./searchBar";
import ButtonLink from "./buttonLink";
import DropdownMenu from "./DropdownMenu";
import Notification from "./notification";

function NavBar() {
	const { t } = useTranslation();
	const [menuOpen, setMenuOpen] = useState(false);
	const [notification, setNotification] = useState<string | null>(null);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		const token = localStorage.getItem("token");

		try {
			if (token) {
				const response = await fetch("http://localhost:8080/logout", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					setNotification(t("navbar.logout.success"));
				} else {
					setNotification(t("navbar.logout.forced"));
				}
			} else {
				setNotification(t("navbar.logout.done"));
			}
		} catch (error) {
			console.error("Erreur lors de la dÃ©connexion backend :", error);
			setNotification(t("navbar.logout.networkError"));
		} finally {
			localStorage.removeItem("token");

			setTimeout(() => {
				setNotification(null);
				navigate("/login", { replace: true });
			}, 1500);
		}
	};

	return (
		<div className="flex items-center bg-bdarkgreen w-[90%] sm:h-18 h-15 inset-0 p-1.5 fixed rounded-lg my-4 mx-auto shadow-sm shadow-black z-99">
			{notification && (
				<Notification
					message={notification}
					onClose={() => setNotification(null)}
				/>
			)}

			<ButtonLink
				link="http://localhost:5173/games"
				color="bg-[#00509f]"
				className="m-auto font-extrabold lg:text-xl md:text-sm sm:text-sm text-xs transition me-5"
			>
				<p>
					<span className="text-white">Click</span>
					<span className="text-[#ef4639]">Bet</span>
				</p>
			</ButtonLink>

			<div className="relative overflow-visible m-auto h-10 rounded-lg group hover:outline-2 hover:outline-white active:scale-90">
				<SearchBar />
			</div>

			<ButtonLink
				link="http://localhost:5173/clicker"
				color="bg-[#fb4740]"
				className="hidden sm:flex"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="stroke-white sm:size-8 size-12"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
					/>
				</svg>
				<p className="my-auto text-xl text-white sm:inline hidden font-bold">
					{t("navbar.gamble")}
				</p>
			</ButtonLink>

			<ButtonLink
				link="http://localhost:5173/profil"
				color="bg-[#3c9b71]"
				className="hidden sm:flex"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="stroke-white sm:size-8 size-12"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
					/>
				</svg>
				<p className="me-5 my-auto text-white text-xl sm:inline hidden font-bold">
					{t("navbar.profile")}
				</p>
			</ButtonLink>

			<DropdownMenu
				className="rounded-2xl ms-3 shadow-black/50 shadow-md sm:w-[10%] w-20 flex items-center justify-center h-full"
				color="bg-bred"
				items={[
					{ label: t("navbar.dropdown.home"), href: "/games" },
					{ label: t("navbar.dropdown.profile"), href: "/profil" },
					{ label: t("navbar.dropdown.support"), href: "/support" },
					{ label: t("navbar.dropdown.clicker"), href: "/clicker" },
					{ label: t("navbar.dropdown.quest"), href: "/quest" },
					{ label: t("navbar.dropdown.terms"), href: "/terms" },
					{ label: t("navbar.dropdown.logout"), onClick: handleLogout },
				]}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-8 shrink-0 stroke-white"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>

				<p className="hidden lg:block text-white font-bold text-xl whitespace-nowrap">
					{t("navbar.menu")}
				</p>
			</DropdownMenu>
		</div>
	);
}

export default NavBar;