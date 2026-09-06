*This project has been created as part of the 42 curriculum by hrouchy, ldescamp, quelefev, tordner.*


# Transcendance

## Description

Transcendance is a full-stack web application developed as part of the 42 curriculum, designed to deliver a modern and interactive gaming hub experience. The platform serves as a centralized interface for discovering, reviewing, and playing games collaboratively.

* **Game Library & Rating System:** Explore an extensive catalog of games, rate titles, and organize your collection into dedicated lists (Liked, Disliked, and Wishlist).
* **Real-Time Multiplayer Game:** Engage in a custom, real-time multiplayer game supporting 2 to 5 players seamlessly powered by WebSockets.
* **Real-Time Chat & Social Features:** Communicate instantly with other users via a robust WebSocket-driven chat system equipped with additional interactive features.
* **Support Ticket System:** Integrated ticketing platform for submitting and managing user support claims and inquiries.
* **Multi-Language & Mirroring Support:** Fully localized across 4 languages with complete layout mirroring capabilities.
* **Gamification & Leaderboards:** Progression system featuring user levels, daily challenges, and competitive leaderboards.

## Instructions

### Prerequisites

To run this project, make sure you have the following software and tools installed on your system:
* **Docker** & **Docker Compose** (or **Podman** & **podman-compose**)
* **Make** (for executing the Makefile commands)

### Configuration Setup

Before running the application, you need to configure the required environment variables by setting up the `.env` . Make sure to populate this file with your specific configuration values use .env.example as a template


**Execution**

The project is containerized and managed using a Makefile. You can use the following available commands to build, run, and manage the application lifecycle:  
   
**Available Commands**

* **`make`** or **`make all`**: Generates required SSL certificates, builds and starts the container stack in the background, and runs the backend application.
* **`make up`**: Generates SSL certificates if missing, pulls necessary container images (PostgreSQL and pgadmin4), and launches the stack using `podman-compose`.
* **`make down`**: Stops and removes the running containers.
* **`make clean`**: Deletes the generated `certificates` directory.
* **`make fclean`**: Removes the certificates and deletes the compiled `Transcendance` binary.
* **`make re`**: Performs a full reset by stopping containers, cleaning all generated files and binaries, and rebuilding everything from scratch.
* **`make db_wipe`**: Prompts for confirmation and completely wipes the database volume data (`./docker/.DB_data`).


## Resources

* [Go Official Documentation](https://go.dev/doc/)
* [Tailwind CSS Official Documentation](https://v2.tailwindcss.com/docs)
* [Tailwind CSS in React Crash Course 2026](https://www.youtube.com/watch?v=bnfhmr1v028&t=173s)
* [GORM Documentation](https://gorm.io/docs/index.html)
* Frontend: Diverse tutorials on YouTube for specific features
* [Go Programming – Golang Course with Bonus Projects](https://www.youtube.com/watch?v=un6ZyFkqFKo)

**AI usage**

Artificial Intelligence was used primarily as a technical tutor throughout the project and occasionally to refactor or optimize code, particularly on the frontend. Additionally, AI was leveraged to translate the application into four different languages, including one with a right-to-left (RTL) reading direction.


## Modules

Here is the list of modules we have implemented along with their types and point values:

| ID | Module / Feature | Type | Value | Justification |
| :---: | :--- | :---: | :---: | :--- |
| | **WEB MODULE** | | | |
| 1 | Use framework for both frontend and backend | MAJOR | 2 points | Built with React for the frontend and Gin for the backend. |
| 2 | Implement Realtime socket using WebSocket | MAJOR | 2 points | Real-time chat and multiplayer game powered by WebSockets. |
| 3 | Allow users to interact with other users | MAJOR | 2 points | Direct messaging via chat, alongside a like and dislike system for comments. |
| 4 | Use an ORM for the database | MINOR | 1 point | Using Gorm as ORM |
| 5 | Complete notification system | MINOR | 1 point | Notifications triggered upon login, within the chat, and when new posts are created. |
| 6 | Custom-made design system | MINOR | 1 point | Integration of over 10 custom design components. |
| 7 | Implement advanced search functionality | MINOR | 1 point | Search bar supporting targeted keyword queries and dynamic filters. |
| | **ACESSIBILITY AND INTERNATIONALIZATION** | | | |
| 8 | Support for multiple languages (at least 3 languages) | MINOR | 1 point | Support french, spanish and english |
| 9 | Right-to-left (RTL) language support | MINOR | 1 point | support arabic and layout mirroring |
| 10 | Support for additional browsers | MINOR | 1 point | support chromium firefox and ecosia |
| | **USER MANAGEMENT MODULE** | | | |
| 11 | Standard user management and authentication | MAJOR | 2 points | Full user profile system with session logging, registration, login, and logout capabilities. |
| 12 | Game statistics and match history | MINOR | 1 point | Comprehensive match history tracking paired with a global leaderboard. |
| | **GAMING MODULE** | | | |
| 13 | Implement a complete web-based game | MAJOR | 2 points | Fully realized online roulette game implemented natively for the web. |
| 14 | Multiplayer game (more than two players) | MAJOR | 2 points | Simultaneous multiplayer support accommodating 2 to 5 players per session. |
| 15 | Advanced chat features | MINOR | 1 point | Game invitations directly through chat, friend lists, and user blocking options. |
| 16|  gamification system to reward users for their actions | MINOR | 1 point | gamification system with level, daily quest and leaderboard, progress bar and clear mecanism|
| | **DATA AND ANALYTICS**| | | |
| 17 | GDPR compliance features | MINOR | 1 point | user can export his data when deleting account.
| | **CHOICE MODULE** | | | |
| 18 | Implement a customer service for reclamation | MINOR | 1 point | Support ticket system that automatically forwards messages containing the player's UUID and body directly to our support email. |
| ***TOTAL*** | | | **24 points** | |

### Bonus Module Justification

* **Why we chose this module:** We implemented this feature to allow users to directly submit feedback and report bugs, facilitating continuous site improvement based on real user experience.
* **Technical challenges addressed:** Integrating this functionality required setting up and configuring a dedicated SMTP server service. While manageable, this challenge ensured secure, reliable mail delivery without relying on third-party dependencies.
* **Value added to the project:** This module significantly enhances project scalability and paves the way for future user-friendly enhancements. By turning everyday users into active testers, it creates a direct loop for community-driven quality assurance and feature development.

## Team Information

|Team Member | Role | Description |
| :---: | :---: | :--- |
| Hrouchy | Product Owner / Developer | Responsible for the da of the website and the game module |
| Ldescamp | Technical Lead / Architect / Developer | Responsible of the architecture of the backend |
| Quelefev | Scrum Master / Developer | Organisation and developing diverse feature |
| Tordner  | Fix Developer / Developer| Implement chat additionnal feature and help fix chat globally. Implement auto translation |

## Project Management

Effective collaboration, structured planning, and transparent communication were key to the success of our Transcendance project. 

* **Team Organization & Workflow:** We maintained a rigorous daily group work routine on-site. Our Scrum Manager oversaw project tracking and planning. Code supervision and quality verification were handled respectively by the Technical Lead (for backend development) and the Product Owner (for frontend development). Major decisions regarding game mechanics, added modules, and their concrete implementation were made collectively as a team.
* **Project Management Tools:** We utilized GitHub for overall project management, issue tracking, and version control.
* **Communication Channels:** Discord was used as our primary digital communication channel for remote updates, although the vast majority of our collaborative work took place in-person on-site.

## Technical Stack

The technical stack for Transcendance was chosen to ensure high performance, maintainability, and a robust architecture across both the frontend and backend.

* **Frontend Technologies:** 
  * Built using **React** with **TypeScript** for type safety and component-driven architecture.
  * Styled with **Tailwind CSS**, allowing us to create a flexible, custom, and fully reusable graphical component system to style the entire application dynamically.
  * Integrated **i18n** for multi-language translation support.

* **Backend Technologies:** 
  * Powered by **Go**, chosen because it shares conceptual closeness to C and C++ (languages we master through our curriculum) while being extremely popular and modern in current software development.
  * Utilizes **GORM** as the Object-Relational Mapping (ORM) library to simplify database interactions, handle complex queries cleanly, and manage schema migrations efficiently.

* **Database System:** 
  * Postgres chosen for its reliability, robust handling of relational data, and seamless compatibility with Go and GORM.

## Features List

| ID | Feature Name | Category / Module | Author | Description |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Frontend Architecture | Web Module | hrouchy | Single-page application built with React, TypeScript, and Tailwind CSS. |
| 2 | Backend Services | Web Module | ldescamp | REST and WebSocket API developed using Go and Gin. |
| 3 | Real-Time WebSockets | Web Module | ldescamp hrouchy | Live communication hub for multiplayer game state synchronization and chat. |
| 4 | Database ORM | Web Module | ldescamp tordner | Relational data management and schema migrations handled via GORM. |
| 5 | Notification System | Web Module | quelefev | Real-time alerts triggered on login, chat messages, and post creation. |
| 6 | Custom Design System | Web Module | quelefev hrouchy | Reusable component library styling the entire application. |
| 7 | Advanced Search | Web Module | quelefev hrouchy | Keyword queries and dynamic filtering across platform content. |
| 8 | Multi-Language Support | Accessibility & i18n | tordner | Full localization supporting French, Spanish, and English via i18n. |
| 9 | RTL Layout Mirroring | Accessibility & i18n | tordner | Interface orientation adjustments supporting Arabic text and layout flow. |
| 10 | Cross-Browser Compatibility | Accessibility & i18n | tordner | Validated support for Chromium, Firefox, and Ecosia. |
| 11 | Authentication & Profiles | User Management | ldescamp hrouchy | Secure user registration, session management, and profile customization. |
| 12 | Stats & Leaderboards | User Management | quelefev | Match history tracking, and global player rankings. |
| 13 | Web-Based Game (Roulette) | Gaming Module | hrouchy | Fully interactive online roulette game developed for the web platform. |
| 14 | Multiplayer Sessions | Gaming Module | hrouchy | Simultaneous multi-player room system supporting 2 to 5 participants. |
| 15 | Social & Chat Features | Web | hrouchy tordner | Direct messaging, friend lists, user blocking, and in-chat game invites. |
| 16 | Gamification System | Gaming Module | quelefev | Progression mechanics featuring player levels, daily quests, and rewards. |
| 17 | GDPR Compliance | Data & Analytics | tordner | Automated user data export functionality tied to account deletion. |
| 18 | Support Ticket System | Choice Module | quelefev | Reclamation portal forwarding player UUIDs and messages to support email. |

