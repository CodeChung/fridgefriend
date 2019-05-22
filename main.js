// function test() {
//     let url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients=apples%2Ccheese%2Cwine%2Ccumin"
    // const options = {
    //     headers: {
    //         "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    //         "X-RapidAPI-Key": "17f5c1d57emsh9c38ba28668b1a1p103a40jsn5763af6646d2"
    //     },
    // };
    // fetch(url, options)
    //     .then(response => {
    //         console.log(response.headers)
    //         console.log(response);
    //         return response.json()})
    //     .then(responseJson => 
    //         console.log(responseJson));
// }
// $(test);

"use strict";

let ingredientList = [];
let recipeList = [];
const edamamUrl = "https://api.edamam.com/search?";
// const edamamId = "12b959ba";
// const edamamApiKey = "0ff0b20b2cc4c31867eb4788a361d8d2";
const edamamId = "e1a9af3e";
const edamamApiKey = "893c9d58fe845be145348f72c95bd5d9";
const youtubeUrl = "https://www.googleapis.com/youtube/v3/search?";
const youtubeApiKey = "AIzaSyCGR7I6ui7MVs7YuSXq7bDvxK3IJAZ6qtA";

function addIngredient() {
    $('form.add-ingredient').submit(event => {
        event.preventDefault();
        // if ($('.ingredient-list li').length > 10) {
        //     console.log("Refrigerator is FULL")
        // } else {
            const ingredient = $("#ingredient-input").val();
            ingredientList.push(ingredient)
            $("#ingredient-input").val("");
            displayIngredients();
        // }
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
        // i could add features diet and health later
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

function displayRecipes(responseJson) {
    const ingredientListCopy = [...ingredientList];
    convertRecipeJson(responseJson);
    //should i split this up?
    if (recipeList.length === 0) {
        $('.recipe-carousel').append("<h2>Uhoh spaghetti-o's no results found. Try a differnt combination or try less ingredients</h2>")
    }
    recipeList.forEach((recipe, index) => {
        $('.recipe-carousel').append(
            `<div class="recipe-card" id="recipe-${index}">
                <div class="tab">
                    <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-1', '${index}')">Dish</button>
                    <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-2', '${index}')">Nutrition</button>
                    <button class="tablinks-${index}" onclick="openTab(event, '${index}-tab-3', '${index}')">Cook</button>
                </div>
                <div id="${index}-tab-1" class="tab-content-${index}">
                    <img src="${recipe.image}" alt="picture of ${recipe.name}">
                    <h2>${recipe.name}</h2>
                </div>
                <div id="${index}-tab-2" class="tab-content-${index} hidden">
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
                    <div class="health-tags" id="health-tag-${index}"></div>
                </div>
                <div id="${index}-tab-3" class="tab-content-${index} hidden">
                    <div class="ingredients">
                        <h2>Ingredients</h2>
                        <ul class="ingredients-list" id="ingredients-list-${index}">
                        </ul>
                    </div>
                    <button><a href="${recipe.link}" target="_blank">Recipe</a></button>
                    <button class="find-videos">Watch and Learn</button>
                </div>
            </div>`
        );
        recipe.healthTags.forEach(tag => $(`#health-tag-${index}`).append(`<span class="health-tags">${tag}</span>`));
        recipe.ingredients.forEach(ingredient => $(`#ingredients-list-${index}`).append(`<li>${ingredient.text}</li>`))
    })
    ingredientListCopy.forEach(item => $(`.ingredients-list li:contains('${item}')`).addClass("already-have"));
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
        $('.recipe-carousel').empty();
        $('.video-carousel').empty();
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
        description: video.snippet.description
    }))
    return videoList;
}

function displayVideos(youtubeJson) {
    const videos = convertYoutubeObject(youtubeJson);
    videos.forEach(video => {
        $('.video-carousel').append(`
            <div class="video">
                <h3>${video.title}</h3>
                <a href="${video.link}" target="_blank"><img src="${video.thumbnail}" alt="video thumbnail"></a>
                <p><b>Description: </b>${video.description}</p>
            </div>
        `)
    })
}

function callYoutubeApi(recipeName) {
    $('.video-carousel').empty();
    const recipeQuery = recipeFormatted(recipeName);
    const youtubeParams = `part=snippet&maxResults=10&q=${recipeQuery}&key=${youtubeApiKey}`;
    const searchUrl = youtubeUrl + youtubeParams;
    console.log(searchUrl);
    fetch(searchUrl)
        .then(response => response.json())
        .then(responseJson => displayVideos(responseJson))
        .catch(err => alert(err));
}

function revealVideoSection() {
    $('.recipe-carousel').on('click', '.find-videos', event => {
        const recipeName = ($(event.target).siblings("h2").text() + " recipe");
        callYoutubeApi(recipeName);
        $('.videos').removeClass('hidden');
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".videos").offset().top
        }, 2000);
    })
}

function greeting() {
    $('h1').click(event => $('audio').trigger('play'))
}

$(function startPage() {
    addIngredient();
    deleteIngredient();
    submitIngredients();
    revealVideoSection();
    greeting();
})