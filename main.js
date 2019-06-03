"use strict";

let ingredientList = [];
let recipeList = [];
const edamamUrl = "https://api.edamam.com/search?";
const edamamId = "e1a9af3e";
const edamamApiKey = "893c9d58fe845be145348f72c95bd5d9";
const youtubeUrl = "https://www.googleapis.com/youtube/v3/search?";
const youtubeApiKey = "AIzaSyCGR7I6ui7MVs7YuSXq7bDvxK3IJAZ6qtA";

function addIngredient() {
    $('form.add-ingredient').submit(event => {
        event.preventDefault();
        const ingredient = $("#ingredient-input").val();
        speakIngredient(ingredient);
        ingredientList.push(ingredient)
        $("#ingredient-input").val("");
        displayIngredients();
    })
}

function displayIngredients() {
    $('.ingredient-list').empty();
    ingredientList.forEach(ingredient => {
        $('.ingredient-list').append(`
        <li id="${ingredient}">${ingredient} <button class="ingredient-button" id="${ingredient}">X</button></li>
        `);
    })
}

function deleteIngredient() {
    $('.ingredient-list').on('click', '.ingredient-button', event => {
        const ingredientId = event.target.getAttribute("id");
        $(`#${ingredientId}`).remove();
        ingredientList = ingredientList.filter(item => item !== ingredientId);
    })
}

function ingredientsFormatted() {
    return ingredientList.map(ingredient => ingredient.trim().replace(" ", "+")).join("%2C");
}

function paramsFormatted(queryParams) {
    return Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join("&");
}

function callEdamamApi() {
    // https://developer.edamam.com/edamam-docs-recipe-api
    const searchQueryItems = ingredientsFormatted();
    const queryParams = {
        q: searchQueryItems,
        app_id: edamamId,
        app_key: edamamApiKey,
        to: 10
    }
    
    const edamamParams = paramsFormatted(queryParams)
    const url = edamamUrl + edamamParams;
    if (!searchQueryItems) {
        alert("You have no ingredients") 
    } else {
        fetch(url)
        .then(response => response.json())
        .then(responseJson => displayRecipes(responseJson))
        .catch(err => $('.error-message').html("uh oh, " + err))  
    }
}

function stripQuotes(string) {
    return string.split(" ").filter(word => word !== "'" && word !== '"').join(" ");
}

function convertRecipeJson(responseJson) {
    $('.error-message').empty();
    recipeList = [];
    const recipes = responseJson["hits"];
    recipes.forEach(dish => recipeList.push({
        name: dish.recipe.label,
        label: stripQuotes(dish.recipe.label),
        link: dish.recipe.url,
        ingredients: dish.recipe.ingredients,
        calories: Math.floor(dish.recipe.calories),
        image: dish.recipe.image,
        macros: {
            carbs: dish.recipe.totalNutrients.CHOCDF || 'N/A',
            proteins: dish.recipe.totalNutrients.PROCNT || 'N/A',
            fats: dish.recipe.totalNutrients.FAT || 'N/A',
        },
        healthTags: dish.recipe.healthLabels.concat(dish.recipe.dietLabels),
    }));
}

function recipeHtml(recipe, index) {
    return `
    <div class="recipe-card" id="recipe-${index}">
        <div class="tab">
            <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-1', '${index}')">Dish</button>
            <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-2', '${index}')">Nutrition</button>
            <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-3', '${index}')">Cook</button>
        </div>
        <div id="${index}-tab-1" class="tab-content-${index}">
            <div class="food-pic">
                <h2>${recipe.name}</h2>
                <img src="${recipe.image}" alt="picture of ${recipe.name}">
            </div>
        </div>
        <div id="${index}-tab-2" class="tab-content-${index} hidden">
            <div class="nutrition">
                <h2>${recipe.name}</h2>
                <table>
                    <tr>
                        <td>Calories:</td>
                        <td>${recipe.calories}</td>
                    </tr>
                    <tr>
                        <td>Carbs:</td>
                        <td>${Math.floor(recipe.macros.carbs.quantity)} ${recipe.macros.carbs.unit}</td>
                    </tr>
                    <tr>
                        <td>Proteins:</td>
                        <td>${Math.floor(recipe.macros.proteins.quantity)} ${recipe.macros.proteins.unit}</td>
                    </tr>
                        <td>Fats:</td>
                        <td>${Math.floor(recipe.macros.fats.quantity)} ${recipe.macros.fats.unit}</td>
                    </tr>
                </table>
                <div class="health-tag" id="health-tag-${index}"></div>
            </div>
        </div>
        <div id="${index}-tab-3" class="tab-content-${index} hidden">
            <div class="cooking">
                <h2>${recipe.name}</h2>
                <div class="recipe-ingredients">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list" id="ingredients-list-${index}">
                    </ul>
                    <button class="cook-button"><a class="get-recipe-page" href="${recipe.link}" target="_blank">Recipe</a></button>
                    <button class="cook-button find-videos">Watch & Learn</button>
                </div>
            </div>
        </div>
    </div>
    `
}

function displayRecipes(responseJson) {
    const ingredientListCopy = [...ingredientList];
    convertRecipeJson(responseJson);
    if (recipeList.length === 0) {
        $('.recipe-carousel').append("<h2 class='error'>Uhoh spaghetti-o's no results found. Try a differnt combination or try less ingredients</h2>")
    }
    recipeList.forEach((recipe, index) => {
        $('.recipe-carousel').append(
            recipeHtml(recipe, index)
        );
        recipe.healthTags.forEach(tag => $(`#health-tag-${index}`).append(`<div class="health-tags">${tag}</div>`));
        recipe.ingredients.forEach(ingredient => $(`#ingredients-list-${index}`).append(`<li>${ingredient.text}</li>`))
    })
    ingredientListCopy.forEach(item => $(`.ingredients-list li:contains('${item}')`).addClass("already-have"));
    scrollToElement('.recipe-carousel');
}

function openTab(event, recipeTab, recipeIndex) {
    let tabContent, tabLinks;
    tabContent = document.getElementsByClassName(`tab-content-${recipeIndex}`);
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName(`tablinks-${recipeIndex}`);
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace("active", "");
    }
    document.getElementById(recipeTab).style.display = "block";
    event.currentTarget.className += "active";
}

function submitIngredients() {
    $('button.find-recipe').click(event => {
        clearSections();
        $('.videos').addClass('hidden')
        callEdamamApi();
    })
}

function recipeFormatted(recipeName) {
    return recipeName.split(" ").join("%20");
}

function convertYoutubeObject(youtubeJson) {
    const videoListJson = youtubeJson.items;
    const videoList = videoListJson.map(video => ({
        link: "https://www.youtube.com/watch?v=" + video.id.videoId,
        thumbnail: video.snippet.thumbnails.high.url,
        title: video.snippet.title,
    }))
    return videoList;
}

function displayVideos(youtubeJson) {
    const videos = convertYoutubeObject(youtubeJson);
    videos.forEach(video => {
        $('.video-carousel').append(`
            <div class="video">
                <a href="${video.link}" target="_blank"><img src="${video.thumbnail}" alt="video thumbnail"></a>
                <h3>${video.title}</h3>
            </div>
        `)
    })
}

function callYoutubeApi(recipeName) {
    $('.video-carousel').empty();
    const recipeQuery = recipeFormatted(recipeName);
    const youtubeParams = `part=snippet&maxResults=8&q=${recipeQuery}&key=${youtubeApiKey}`;
    const searchUrl = youtubeUrl + youtubeParams;
    fetch(searchUrl)
        .then(response => response.json())
        .then(responseJson => displayVideos(responseJson))
        .catch(err => alert(err));
}

function revealVideoSection() {
    $('.recipe-carousel').on('click', '.find-videos', event => {
        const recipeName = ($(event.target).parent().siblings("h2").text() + " recipe");
        callYoutubeApi(recipeName);
        $('.videos').removeClass('hidden');
        scrollToElement('.videos');
    })
}

function scrollToElement(element) {
    $([document.documentElement, document.body]).animate({
        scrollTop: $(element).offset().top
    }, 2000);
}

function speak() {
    $('h1').click(event => $('#welcome').trigger('play'))
    $('.get-recipe-page').click(event => $('#recipe').trigger('play'));
    $('.find-recipe').click(event => $('#get-recipes').trigger('play'))
}

function speakIngredient(ingredient) {
    $('audio').each(function(){
        this.pause();
        this.currentTime = 0;
    }); 
    if (ingredient.includes("bread") || ingredient.includes("french") || ingredient.includes("croissant")) {
        $('#croissant').trigger('play')
    }
    else if (ingredient.includes("rice") || ingredient.includes("chinese") || ingredient.includes("stir") || ingredient.includes("fry") || ingredient.includes("whip")) {
        $("#kitchen").trigger("play")
    } else if (ingredient.includes("fridge") || ingredient.includes("refridgerator")) {
        $("#poem").trigger("play");
    } else if (ingredient.includes("cold") || ingredient.includes("ice")) {
        $("#cold").trigger("play");
    } else if (ingredient.includes("beef") || ingredient.includes("meat") || ingredient.includes("chicken") || ingredient.includes("pork") || ingredient.includes("steak") || ingredient.includes("burger")) {
        $("#beef").trigger("play");
    }
}

function clearSections() {
    $('.video-carousel').empty();
    $('.recipe-carousel').empty();
}

function startOver() {
    $('.start-over').click(event => {
        event.preventDefault();
        clearSections();
        scrollToElement('html');
        $('.videos').addClass('hidden');
    })
}

$(function startPage() {
    addIngredient();
    deleteIngredient();
    submitIngredients();
    revealVideoSection();
    speak();
    startOver();
})