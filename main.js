function test() {
    let url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients=apples%2Ccheese%2Cwine%2Ccumin"
    const options = {
        headers: {
            "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            "X-RapidAPI-Key": "17f5c1d57emsh9c38ba28668b1a1p103a40jsn5763af6646d2"
        },
    };
    fetch(url, options)
        .then(response => {
            console.log(response.headers)
            console.log(response);
            return response.json()})
        .then(responseJson => 
            console.log(responseJson));
}

$(test);