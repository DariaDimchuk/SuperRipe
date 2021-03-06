

/*	WINDOW ONLOAD FUNCTIONALITY	*/


    /**
     * Runs when the page is loaded.
     *
     * Important: all common code between scripts and pages must be repeated again in window.onload - otherwise another
     * script page will overwrite the needed code.
     *
     * So, don't combine common code in window.onload between pages into one script file and hope it'll all get called.
     */
    window.onload=function(){
        getQueryResultsFromPHPfile(recipeSearchResults_PHP);
        triggerSearchOnEnter(); //must be called in window.onload to avoid null
    };




/*  SERVER CONNECTION FUNCTIONS    */


    /**
     * Method used to show the link results to recipes on page 2 after a search.
     *
     * Ajax connection to a selected php file. The search query is selected by using the URL search.
     *
     * Method connects to database, runs the selected PHP file, and returns results.
     * @param phplink - name of php file that searches DB for all applicable recipes
     */
    function getQueryResultsFromPHPfile(phplink){

        if(invalidQueryStopped(getURLqueryValue())){
            //do nothing, hidden content already hidden
        }else{
            $.ajax({
                url: phplink + querystartURLKeyword + getURLqueryValue(),
                dataType: "html",
                type: "GET",
                data: {output: "html"},
                success: function(data) {
                    console.log(data);

                    $(".content").show();
                    document.getElementById("search-result-show").textContent= "Search: " + toTitleCase(getURLqueryValue());

                    //displays results on page
                    fillSearchResultContent(JSON.parse(data).length, JSON.parse(data));
                },
                error: function(jqXHR, textStatus, errorThrown) {

                    document.getElementById("search-result-show").textContent= "Nothing found. Try something else!";
                    $(".content").hide();
                }
            });
        }

    }//end method




    /**
     * On a search, this method triggers server side and displays the returned array
     * of results (as $recipe objects) in the appropriate categories by looping through array
     *
     * @param arraysize - size of the array, use 'sizeof($arraynamehere)' in PHP server-end
     * @param recipeArray - array of $recipe objects.
     */
    function fillSearchResultContent(arraysize, recipeArray){

        if(arraysize === 0 || recipeArray === null || recipeArray === ""){
            document.getElementById("search-result-show").textContent= toTitleCase(getURLqueryValue()) + " not found. Try something else!";
            $(".content").hide();

        }else{
            $(".content").show();

            //get rid of duplicates
            var uniqueArr = uniqueArray(recipeArray);

            //display each unique recipe by category on page
            for (i=0; i<uniqueArr.length; i++) {

                var recipe = uniqueArr[i];
                if(recipe !== null){

                    var category = recipe["category"];

                    if(category === "food"){
                        $(".food").show();
                        fillCategory("#food-recipes", recipe);
                    }

                    if(category === "beauty"){
                        $(".health").show();
                        fillCategory("#health-recipes", recipe);
                    }

                    if(category === "household"){
                        $(".household").show();
                        fillCategory("#household-recipes", recipe);
                    }

                    if(category === "tip"){
                        $(".tips").show();
                        fillCategory("#tips-recipes", recipe);
                    }
                }//end null check

            }//end loop

        }//end else

    }//end method




/*	RESULTS BUTTONS FUNCTIONALITY	*/


    /**
     * When clicked, FOOD button on the search results page will reveal content
     * with a swing animation. Will hide content when clicked again.
     */
    $(document).ready(function(){
        $("#food-button").click(function(){
            $("#food-recipes").toggle("450", "swing", function(){
                //Animation done.
            });
        });
    });


    /**
     * When clicked, HOUSEHOLD button on the search results page will reveal content
     * with a swing animation. Will hide content when clicked again.
     */
    $(document).ready(function(){
        $("#household-button").click(function(){
            $("#household-recipes").toggle("450", "swing", function(){
                //Animation done.
            });
        });
    });


    /**
     * When clicked, HEALTH button on the search results page will reveal content
     * with a swing animation. Will hide content when clicked again.
     */
    $(document).ready(function(){
        $("#health-button").click(function(){
            $("#health-recipes").toggle("450", "swing", function(){
                //Animation done.
            });
        });
    });


    /**
     * When clicked, TIPS button on the search results page will reveal content
     * with a swing animation. Will hide content when clicked again.
     */
    $(document).ready(function(){
        $("#tips-button").click(function(){
            $("#tips-recipes").toggle("450", "swing", function(){
                //Animation done.
            });
        });
    });




/*   CONTENT METHODS   */


    /**
     * Makes an array have no duplicate recipe values.
     * Does NOT check by ID - checks by name + directions + ingredients list.
     * (Duplicates will always have different IDs but the same contents).
     *
     * @param array - array to make unique
     * @returns {any[]} - returns array with no duplicates
     */
    function uniqueArray(array) {
        var uniqueArray = new Array();

        //for each recipe
        for(i = 0; i < array.length; i++){
            var currentRecipe = array[i];

            var unique = true;  //resets each loop

            //if a copy exists in new array, not unique, so don't add.
            //DO NOT check by ID - duplicates will have different IDs
            for(x = 0; x < uniqueArray.length; x++){

                if((currentRecipe["directions"] === uniqueArray[x]["directions"])
                    && (currentRecipe["ingredients"] === uniqueArray[x]["ingredients"])
                    && (currentRecipe["name"] === uniqueArray[x]["name"]))
                {
                    unique = false;
                }
            }//end loop

            //add if unique
            if(unique){
                uniqueArray.push(currentRecipe);
            }
        }//end loop

        return uniqueArray;

    }//end method



    /**
     * Takes recipe object and the id of the category, and appends the recipe object's contents to the category.
     *
     * @param jqueryCategorySelector - id of category for jquery to select. Include '#'
     * @param recipe - recipe object from PHP
     */
    function fillCategory(jqueryCategorySelector, recipe) {
        var category = $(jqueryCategorySelector);

        category.append(recipe["html_link"] + "<br>");

        category.append("<p class='link_details'>Total Time: " + getFormattedTotalTime(calcTotalTime(recipe["prep_time"], recipe["cook_time"])) + "</p>");
        category.append("<p class='link_details'>Total Ingredients: " + recipe["num_of_ingredients"] + "</p>");
        category.append("<br>");
    }//end method



    /**
     * Ensures nothing shows on an empty query, and checks for easter egg
     * @param query - the URL query
     * @returns {boolean} - true to STOP query, false to allow query
     */
    function invalidQueryStopped(query){

        if(query === null){
            hideAllContent();
            document.getElementById("search-result-show").textContent= "Nothing found. Try something else!";
            return true;
        }else{
            query = query.replace(/\s/g, "");   //remove whitespace

            //if query is empty, show nothing
            if(query === ""){
                hideAllContent();
                document.getElementById("search-result-show").textContent= "Nothing found. Try something else!";
                return true;    //invalid query
            }

            //if query looks for Easter egg, show it!
            if(toLowerCase(query) === "d20"){
                hideAllContent();
                showEasterEgg();
                return true;
            }

            return false;   //query passed through
        }

    }//end method



    /**
     * Shows easter egg contents.
     */
    function showEasterEgg(){
        $("#search-result-show").append("You arrive at a tavern. The barkeep is a young boy named Jason." +
            " He offers you a random item from the menu. On the house! Let's see what you get!<br>");

        $(".content").show();
        $(".content").append("<br><div class='d20'>" + "<button type='button' id='d20_button' onclick='d20rollFunction(); this.onclick=null;'>" +
            "<img id='d20_img' src='./website_images/dice.png'><div class='d20' id='d20_button_text'>Roll!</div></button> " + "</div>");
    }///end method



    /**
     * When d20 button is clicked, a die is rolled, and a link is provided based on your roll.
     * 20 and 1 show special results, numbers between 2-19 show recipes with those IDs.
     */
    function d20rollFunction(){
        //make random roll between 1 and 20
        var roll = Math.floor(Math.random() * 20) + 1;

        //bigger size for roll number display
        document.getElementById("d20_button_text").style = "font-size: 5vw;";

        //scroll to bottom to show results
        $("html, body").animate({scrollTop: $(document).height()}, "slow");


        //critical miss logic
        if(roll === 1){
            document.getElementById("d20_button_text").innerHTML = roll;

            document.getElementById("bottom_text").innerHTML = "Critical fail, oh boy. You take a sip of the drink Jason offers you." +
                " You start to feel a bit nauseous. Suddenly, you fall to the floor. Shouldn't have trusted Jason the barkeep.<br><br>";

            //Lose gif
            $("#bottom_text").append("<img  id='lose_link' src='./website_images/crit_miss.gif' style='object-fit: contain;width: 80%;-webkit-user-drag: none;'>");

        }//end if



        //critical hit logic
        if(roll === 20){
            document.getElementById("d20_button_text").innerHTML = roll;

            document.getElementById("bottom_text").innerHTML = " Critical! Without a word, Jason, the barkeep hands you an ale and a fabulous " +
                "photo. You sense it may comfort you in your time of need.<br><br>";

            //Win gif
            $("#bottom_text").append("<img  id='win_link' src='./website_images/crit_hit.gif' style='object-fit: contain;width: 80%;-webkit-user-drag: none;'>");

        }//end if



        //Any other roll logic
        if(roll > 1 && roll < 20){
            document.getElementById("d20_button_text").innerHTML = roll.toString();

            document.getElementById("bottom_text").innerHTML = "The barkeep reaches behind the counter and brings you something. <br><br>" + "<a href=# id='d20_link'>Dig in!</a>";

            //dynamically sets the href of the link to the recipe id of the roll
            document.getElementById("d20_link").href = page3_URL + querystartURLKeyword + roll;
        }//end if

    }//end method



/*   BASIC FORMATTING   */


    /**
     * Calculates the total time needed to complete a recipe - cook + prep time added.
     * Checks for invalid numbers.
     *
     * @param prepTime - prep time for the recipe
     * @param cookTime - cook time for the recipe
     * @returns {number} - prep and cook time added (if possible)
     */
    function calcTotalTime(prepTime, cookTime) {

        var total = 0;
        if(!isNaN(prepTime)){
            total += parseInt(prepTime);
        }

        if(!isNaN(cookTime)){
            total += parseInt(cookTime);
        }
        return total;
    }//end method


    /**
     * Returns a string with the formatted total recipe time.
     * If 0, returns "--".
     * Otherwise, returns the total time needed to make the recipe.
     *
     * @param time - total calculated time. (Prep time + cook time added).
     * @returns {*} - string representing total recipe time. If 0, returns "--".
     */
    function getFormattedTotalTime(time){
        if(!isNaN(time)){
            if(time === 0){
                return "--";
            }else{
                return time;
            }
        }else{
            return "--";
        }
    }//end method


    /**
     * Capitalize the first letter of the string, keep the rest lower case.
     * @param str - string to title case
     * @returns {formatted string}
     */
    function toTitleCase(str){
        if(str === null){
            return "";
        }else{
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
    }//end method



    /**
     * Lower case the entire given string.
     * @param str
     * @returns {*}
     */
    function toLowerCase(str) {
        if(str !== null){
            return str.replace(/\w\S*/g, function(txt){return txt.substr(0).toLowerCase();});
        }else return "";
    }//end method


    /**
     * Used to hide the recipe content page, buttons, and sections. Only title, searchbar, and one text field remain.
     */
    function  hideAllContent() {
        $(".food").hide();
        $(".health").hide();
        $(".household").hide();
        $(".tips").hide();
        $(".content").hide();
    }//end method
