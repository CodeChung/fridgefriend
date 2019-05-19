// function test() {
//     let url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients=apples%2Ccheese%2Cwine%2Ccumin"
//     const options = {
//         headers: {
//             "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
//             "X-RapidAPI-Key": "17f5c1d57emsh9c38ba28668b1a1p103a40jsn5763af6646d2"
//         },
//     };
//     fetch(url, options)
//         .then(response => {
//             console.log(response.headers)
//             console.log(response);
//             return response.json()})
//         .then(responseJson => 
//             console.log(responseJson));
// }
// $(test);

"use strict";

const ingredientList = [];
const spoonacularUrl = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?";

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

function callSpoonacularApi() {
    const searchQueryItems = ingredientsFormatted();
    const queryParams = {
        ranking: 2,
        ignorePantry: false,
        ingredients: searchQueryItems,
    }
    const options = {
        headers: {
            "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            "X-RapidAPI-Key": "17f5c1d57emsh9c38ba28668b1a1p103a40jsn5763af6646d2"
        },
    };
    const spoonacularParams = paramsFormatted(queryParams)
    console.log(spoonacularParams);
    if (!searchQueryItems) {
        alert("You have no ingredients") 
    } else {

    }

}

function submitIngredients() {
    $('button.find-recipe').click(event => {
        callSpoonacularApi();
    })
}

$(function startPage() {
    addIngredient();
    deleteIngredient();
    submitIngredients();
})