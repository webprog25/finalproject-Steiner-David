[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19513514&assignment_repo_type=AssignmentRepo)
Final Project
====================

Project Title: Plant Pal
Your Name: David Steiner

Overview
--------
Plant Pal is a simple houseplant watering tracker. It displays your plants as a responsive grid of cards (photo, nickname, species, watering frequency), color‐codes how many days have passed since you last watered each plant, and lets you:

* Water Now (updates its “lastWatered” timestamp)

* Edit plant details in a modal dialog

* Delete plants

* Add new plants. Where you can upload a picture of the plant via drag-and-drop or URL, with live preview and validation of the file format

Running
-------
Just use `npm install` and `npm start`, but make sure the database is running before `npm start`.

Do I need to load data from init_db.mongodb? Yes

Features
--------
* Dashboard: 1–3 cards per row, always centered.

* Legend: explains badge colors and days-since-watering; hover shows tooltip.

* Add-Plant Form: drag-and-drop picture uploader (only images) with a clear button, or image URL.

* Inline Watering: “Water now” button updates the database and badge without a full reload.

* Modal Edit: clean popup form for editing nickname, species, and frequency.

* Delete: remove unwanted plants with a confirmation prompt.

* Mobile-friendly: responsive grid and forms collapse to a single column on phones.

Collaboration and libraries
---------------------------
* The idea behind the cards may seem similar to Frank Schneider's and my own project, "PokeBuild", from the "WebProjekt" course.
* However, the cards in PokeBuild are not filled with user input like this project. 
* They are filled with API data, and the data on the cards is fixed. Therefore, there is no editing as in this project.
* Therefore, the two projects only share the 'card' theme, which I also found suitable for this project.
* Furthermore, since you have access to the PokeBuild GitLab, you can check that I implemented the card idea two months ago in commit 'e8c69113' so I assume that this will not be a problem.


