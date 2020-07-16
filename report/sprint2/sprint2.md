---
title: Words Game Sprint 2
author: Katherine Avila, Anastacia Castro, Elizabeth Huang, Farida Tahiry, and Peter Mawhorter
date: Summer 2020
...

<nav>
[Report Summary](../report.html)
[Sprint 1 Features](../sprint1/sprint1.html)
[Sprint 2 Features](sprint2.html)
[Words Game](https://solsword.github.io/words/)
[Words Github Page](https://github.com/solsword/words/)
[Anarchy Library](https://solsword.github.io/anarchy/)
</nav>

::::: {.body}

::: {.col}

# HINT BUTTON

## About

The hint feature is a menu button that the user can click on to see if the word they typed in is in the current screen they are on. If the word is present, the screen is highlighted to show where each copy of it is. The first letter of the word is searched in the current screen, then it checks to see if any of the letters around match the second letter of the word. If it doesn’t, that match is dismissed and if it does, it repeats the search around that new glyph to check for the next letter. Once it has done this to each letter of the word, the animation mechanism briefly highlights where the first glyph of the sequence of the word is.


## Why did we create a hint feature?

We wanted to create this feature to build on the quiz feature from [sprint 1](../sprint1/sprint1.html). From our experience with word games, it is easy to get stuck and so we wanted a way to help players get un-stuck.

::: {.figure}
![Hint GIF](hint.gif)\ 

The animation above shows the how the hint feature works when the user types in the word 'pea'.
:::

### Future Work

Right now, the user can use the hint as many times as they want; therefore, we hope to later modify it to limit the number of hints the user can utilize; a hint could be one kind of reward in the game. We also hope to explore how to change the way the animation is displayed.

:::

::: {.col}

# AVATARS

## About

The avatar feature allows the player to pick an image to represent them as the player plays the game. As soon as the game is loaded, an avatar will appear at the center of the unlocked tiles. There is now an options menu that allows the player to change the avatar that is currently on the board. As the player connects and deletes the glyphs they have selected, the avatar will follow along the path. Once a word is completed, the avatar does a little jump animation at the end.

## Why did we create an avatar feature?

We wanted to create this feature so that players can be more engaged with the game. An avatar could give a player a sense of connection to the game by seeing a character that represents them on the game board. We are also hoping this feature lays the foundation for other characters in the game as well!

::: {.figure}
![Avatar On the Board](avatar_feature.gif)\ 
The avatar follows the glyphs as the player swipes and plays an animation once the word is completed.
:::

::: {.figure}
![Options Menu](av_menu.gif)\ 
The player has the option to change the random avatar that is placed on the center of the board through the options menu.
:::

## Challenges

A challenge we faced when designing and animating the avatar was learning the SVG format and how to animate for the first time. It took a while to figure how to convert between different files and to finally get it working and displaying in the game. Another challenge was understanding how HTML elements and event handlers work on a web page to accurately place our avatar on the game board, because including an external drawing into the game needed to use a different system from the system used for placing the board tiles.

### Future Work on Avatars

We hope that in the future the avatar feature will be modified such that players will be able to provide their own avatar drawing and animation or otherwise customize their avatar. This also provides the foundation for the possibility of non-player characters (NPCs) that could appear when playing the game as well as a stronger sense of player identity in a word game.

:::

:::::
