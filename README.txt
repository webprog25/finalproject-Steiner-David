[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19513514&assignment_repo_type=AssignmentRepo)
Final Project
====================

Project Title: Plant Pal
Your Name: David Steiner

Overview
--------
Plant Pal is a personal houseplant watering tracker that helps you remember when each of your plants needs water. 
After signing in with Google, you can add your own plants (with photos), and the app color-codes each plant’s watering status. 
A live doughnut chart gives you a summary of all your plants’ needs.

Running
-------
Just use `npm install` and `npm start`, but make sure the database is running before `npm start`.

Do I need to load data from init_db.mongodb? Yes and please look into the file, before running it.

Features
--------
- **User Authentication**  
  Sign in with Google, so each user sees only their own plants.

- **Automatic Logout on Session Expiry**  
  Automatically logs the user out with an alert when their session token expires, keeping the UI in sync with authentication state.

- **Responsive Dashboard**  
  A centered grid of plant cards (1–3 columns depending on viewport).

- **Responsive Design**  
  Includes `@media` breakpoints and a mobile-friendly viewport meta tag for phone/tablet layouts.

- **Color‐Coded Status**  
  Badges are green/yellow/red based on how close you are to the next watering date.

- **Interactive Chart**  
  A Doughnut chart shows the count of plants “On Track,” “Due Soon,” or “Overdue.”

- **Add Plant**  
  Drag-and-drop image uploader (file or URL), with live preview and format validation.

- **Water Now**  
  Click the button to update `lastWatered` in-place (no full page reload), and chart updates instantly.

- **Edit Plant**  
  Modal dialog to change nickname, species, or watering frequency.

- **Delete Plant**  
  Confirm then remove the card in-place; chart animates to show the new counts.

- **Scroll-Preserving Reload**  
  Remembers and restores the users scroll position after watering, editing, or deleting plants so the page does not jump back to the top.

- **Persistent API Key**  
  Stored in `localStorage` so you stay signed in across pages and reloads.

- **Protected Routes**  
  All `/api/plants` endpoints require a valid JWT; unauthenticated users see an intro message and cannot access protected actions.

- **Safe PATCH Updates**  
  The `/api/plants/:id` PATCH endpoint whitelists only `nickname`, `species`, `frequencyDays`, and `lastWatered`, preventing malicious updates to other fields.

- **Skip-to-Content Links**  
  Every page has a “Skip to main content” link (shown only when focused) so keyboard-only users can jump straight past the navigation.

- **Visible Focus Outlines**  
  All focusable elements (links, buttons, form fields) have a clear outline on focus, to make keyboard navigation obvious.

- **ARIA Landmarks**  
  Added `role="banner"`, `role="navigation"` and `role="main"` to the HTML structure so screen-readers can quickly understand page regions.

Collaboration and libraries
---------------------------

I tried to stick as closely as possible to the lecture material.
However, I wanted to use some things that were not covered in the lectures, or maybe I just missed it, to improve the usability of the website.
Below is a list of all third-party resources and references I used in my code, along with their sources.

- **Authentication: Sign in with Google**
  Used Googles Identity Services to handle user login. 
  Followed the CS193x lecture guidance and imported the provided googleauth.js.
  Used the styling guide for the button that was mentioned on the website.

- **Data Visualization: Chart.js**
  Imported Chart.js from jsDelivr (import "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js") 
  to render the watering-status doughnut chart. As mentioned on the lecture website

- **Not covered in the lecture:**

    Scroll-Preserving Reload: prevents the page from jumping back to the top after watering, editing, 
    or deleting a plant by remembering your scroll position and restoring it. 
    Sources:  https://developer.mozilla.org/docs/Web/API/Window/scrollTo
              https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame

    File Uploads: Data URLs + Drag-and-Drop
    Converted uploads to data URLs like the CS193x lecture and added a drag-and-drop interface for images using the 
    HTML Drag-and-Drop and live previews: 
    Sources:  https://developer.mozilla.org/de/docs/Web/API/HTML_Drag_and_Drop_API
              https://developer.mozilla.org/de/docs/Web/API/FileReader

    Edit Plant: Modal Dialog
    Modal overlay to edit plant details in-place.
    Sources:  https://developer.mozilla.org/de/docs/Web/HTML/Reference/Elements/dialog
              https://developer.mozilla.org/de/docs/Web/HTML/Reference/Elements/menu

    Protected Page Redirects:
    In add.html’s <head>, an inline script runs before any other code to check for the stored API key.
    This ensures unauthenticated users never see the form.
    Source: https://developer.mozilla.org/de/docs/Web/API/Location/replace

    Auto-Logout:
    Parse the JWT’s exp claim and use setTimeout to automatically log the user out when their token expires.
    This ensures the user sees an alert and is returned to the anonymous UI exactly at session expiry.
    Sources:  https://stackoverflow.com/questions/39926104/what-format-is-the-exp-expiration-time-claim-in-a-jwt
              https://developer.mozilla.org/en-US/docs/Web/API/Window/atob
              https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library

    Responsive Layouts: @media 
    I used CSS media queries (e.g. @media (max-width: 960px) and @media (max-width: 650px)) to adjust the plant grid and navbar for tablet and mobile layouts.
    Source: https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries

    Custom Styling:  
    Uses CSS custom properties (`--variables`) throughout `styles.css` for easy theming.
    Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties

    Robust Error Handling
    All API calls check `res.ok` and wrap in `try/catch`, showing `alert(...)` for any network or server errors.
    Sources:  https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
              https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

    Safe PATCH Updates  
    The `/api/plants/:id` PATCH endpoint whitelists only allowed fields (`nickname`, `species`, `frequencyDays`, `lastWatered`), preventing malicious owner-overwrites.
    Source: https://blog.appsignal.com/2024/07/03/security-best-practices-for-your-nodejs-application.html

    Accessibility Enhancements:
    Sources:  https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/main_role
              https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label
              https://developer.mozilla.org/en-US/docs/Web/Accessibility

    The idea behind the "cards" may seem similar to Frank Schneider's and my own project, "PokeBuild", from 
    the "WebProjekt" course.
    However, the cards in PokeBuild are not filled with user input like this project and there is no editing as in this project.
    Therefore, the two projects only share the 'card' theme, which I also found suitable for this project.
    Furthermore, since you have access to the PokeBuild GitLab, you can check that I implemented the card idea long time ago in commit 'e8c69113'. 


