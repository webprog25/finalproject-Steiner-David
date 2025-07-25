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

Do I need to load data from init_db.mongodb? Yes

Features
--------
- **User Authentication**  
  Sign in with Google, so each user sees only their own plants.

- **Responsive Dashboard**  
  A centered grid of plant cards (1–3 columns depending on viewport).

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

- **Persistent API Key**  
  Stored in `localStorage` so you stay signed in across pages and reloads.

- **Protected Routes**  
  All `/api/plants` endpoints require a valid JWT; unauthenticated users see an intro message and cannot access protected actions.

Collaboration and libraries
---------------------------
* The idea behind the cards may seem similar to Frank Schneider's and my own project, "PokeBuild", from the "WebProjekt" course.
* However, the cards in PokeBuild are not filled with user input like this project. 
* They are filled with API data, and the data on the cards is fixed. Therefore, there is no editing as in this project.
* Therefore, the two projects only share the 'card' theme, which I also found suitable for this project.
* Furthermore, since you have access to the PokeBuild GitLab, you can check that I implemented the card idea two months ago in commit 'e8c69113' so I assume that this will not be a problem.


