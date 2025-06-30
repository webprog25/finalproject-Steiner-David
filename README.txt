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
* I tried to stick as closely as possible to the lecture material.
* However, I had to use some things that were not covered in the lectures, or maybe I just missed it.
* I tried to follow the lecture for my editing part, but I simply could not stand the way it looked, so I had to use modal.
* The same will apply to some other parts of the code (drag-and-drop, css, 1 forEach, etc). 
* If you punish me with negative points for this ("AI usage"), I will accept it, but I will not be happy about it because, to me, programming isn't just about sticking to the syntax of lectures. 
* It is about trying things out, and sadly, in the current climate, this will seem like AI. 
* Therefore, I have to accept these possible negative points, and I will not blame you because I learnt something, and that is more important to me than any grade. 
  
* The idea behind the cards may seem similar to Frank Schneider's and my own project, "PokeBuild", from the "WebProjekt" course.
* However, the cards in PokeBuild are not filled with user input like this project. 
* They are filled with API data, and the data on the cards is fixed. Therefore, there is no editing as in this project.
* Therefore, the two projects only share the 'card' theme, which I also found suitable for this project.
* Furthermore, since you have access to the PokeBuild GitLab, you can check that I implemented the card idea two months ago in commit 'e8c69113' so I assume that this will not be a problem.

* I did not use any other libraries because the strict 'only lecture or AI' grading policy scared me off.
* However, I will continue to improve this website with non-lecture content because I have a personal use case for it.
* If the 30th June deadline is not that strict, I will push it to this git repro. Please send me an email to confirm this.

