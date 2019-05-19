// function test() {
//     let url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients=apples%2Ccheese%2Cwine%2Ccumin"
//     const options = {
//         headers: {
//             "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
//             "X-RapidAPI-Key": "17f5c1d57emsh9c38ba28668b1a1p103a40jsn5763af6646d2"
//         },
//     };
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

const ingredientList = [];
let recipeList = [];
const edamamUrl = "https://api.edamam.com/search?";
const edamamId = "12b959ba";
const edamamApiKey = "0ff0b20b2cc4c31867eb4788a361d8d2";

function addIngredient() {
    $('form.add-ingredient').submit(event => {
        event.preventDefault();
        const ingredient = $("#ingredient-input").val();
        ingredientList.push(ingredient)
        $("#ingredient-input").val("");
        displayIngredients();
    })
}

function displayIngredients() {
    $('.ingredient-list').empty();
    ingredientList.forEach(ingredient => {
        $('.ingredient-list').append(`
        <li id="${ingredient}">${ingredient} <button class="ingredient-button" id="${ingredient}">delete</button></li>
        `);
    })
}

function deleteIngredient() {
    $('.ingredient-list').on('click', '.ingredient-button', event => {
        console.log($(this).parent().attr("id"));
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

function convertRecipeJson(responseJson) {
    $('.error-message').empty();
    recipeList = [];
    const recipes = responseJson["hits"];
    recipes.forEach(dish => recipeList.push({
        name: dish.recipe.label,
        link: dish.recipe.url,
        ingredients: dish.recipe.ingredients,
        calories: dish.recipe.calories,
        image: dish.recipe.image,
        macros: {
            carbs: dish.recipe.totalNutrients.CHOCDF,
            proteins: dish.recipe.totalNutrients.PROCNT,
            fats: dish.recipe.totalNutrients.FAT
        },
        healthTags: dish.recipe.healthLabels.concat(dish.recipe.dietLabels),
    }));
}

function displayRecipes(responseJson) {
    const ingredientListCopy = [...ingredientList];
    convertRecipeJson(responseJson);
    //should i split this up?
    recipeList.forEach((recipe, index) => {
        console.log(recipe, index);
        console.log(recipe.ingredients)
        console.log(typeof recipe.healthTags)
        $('.recipe-carousel').append(
            `<div class="recipe-card" id="recipe-${index}">
                <img src="${recipe.image}" alt="picture of ${recipe.name}">
                <h2>${recipe.name}</h2>
                <div class="nutrition" id="nutrition-${index}">
                    <table>
                        <tr>
                            <td>Calories</td>
                            <td>${recipe.calories}</td>
                        </tr>
                        <tr>
                            <td>Carbs</td>
                            <td>${recipe.macros.carbs.quantity} ${recipe.macros.carbs.unit}</td>
                        </tr>
                        <tr>
                            <td>Proteins</td>
                            <td>${recipe.macros.proteins.quantity} ${recipe.macros.proteins.unit}</td>
                        </tr>
                            <td>Fats</td>
                            <td>${recipe.macros.fats.quantity} ${recipe.macros.fats.unit}</td>
                        </tr>
                    </table>
                    <div class="ingredients">
                        <h2>Ingredients</h2>
                        <ul class="ingredients-list" id="ingredients-list-${index}">
                        </ul>
                    </div>
                    <div class="health-tags" id="health-tag-${index}"></div>
                </div>
                <button><a href="${recipe.link}" target="_blank">Make it</a></button>
                <button>I don't feel like cooking today</button>
            </div>`
        );
        recipe.healthTags.forEach(tag => $(`#health-tag-${index}`).append(`<span class="health-tags">${tag}</span>`));
        recipe.ingredients.forEach(ingredient => $(`#ingredients-list-${index}`).append(`<li>${ingredient.text}</li>`))
    })
    ingredientListCopy.forEach(item => $(`.ingredients-list li:contains('${item}')`).css("color","red"))
}

function submitIngredients() {
    $('button.find-recipe').click(event => {
        callEdamamApi();
    })
}

$(function startPage() {
    addIngredient();
    deleteIngredient();
    submitIngredients();
})