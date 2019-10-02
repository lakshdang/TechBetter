// Adds CSS which displays the score in a circular div.
function addDiv(id, title, imdbScore, numberOfVotes) {
  const elements = document.getElementsByClassName("bob-title");
  var count = 0;
  Array.prototype.forEach.call(elements, function(element) {

    // We only need to add it to the first element that we find because
    // this is the element that the mouse is hovering on.
    if (count === 0) {

      // Styling the div to be red, circluar, and have large white text.
      const div = document.createElement("div");
      div.style.width = "80px";
      div.style.height = "80px";
      div.style.borderRadius = "50%";
      div.style.background = "red";
      div.style.color = "white";
      div.style.verticalAlign = "center";
      div.style.textAlign = "center";
      div.style.fontSize = "50px";
      div.innerHTML = imdbScore;
      div.id = id

      // Makes sure that we only add the div once.
      if (!document.getElementById(id)) {

        // The actual adding which displays code.
        element.appendChild(div);

        // Testing the chrome console.
        console.log({ title, imdbScore, numberOfVotes });
      }
      count++;
    }
  });
}

// OMDb basically contains all IMDb scores in an API format
// so that users can get easy access to the scores.
// This function gets the actual score and adds to the CSS.
function getIMDbScore(movieOrShowTitle) {
  var id = '';
  const http = new XMLHttpRequest();
  const url = `http://www.omdbapi.com/?s=${movieOrShowTitle}&apikey=YOURKEY`;
  http.open("GET", url)
  http.send()
  http.onreadystatechange = (e) => {
    const responseText = http.responseText;

    // Initially, we need to just search for any movie/tv show with a normal search.
    // The response does not actually have the IMDb score.
    if (responseText) {

      // JSON parsing to get the information from the OMDb API.
      var json = JSON.parse(responseText);
      const moviesOrShows = json ? json["Search"] : undefined;
      const movieOrShow = moviesOrShows ? moviesOrShows[0] : undefined;

      // Once we know that a movie/tv show exsits, we need to get the score
      // of that movie by passing in the ID.
      if (movieOrShow) {
        id = movieOrShow.imdbID;
        const url2 = `http://www.omdbapi.com/?i=${id}&apikey=YOURKEY`;
        http.open("GET", url2)
        http.send()
        http.onreadystatechange = (e) => {
          const responseText2 = http.responseText;
          if (responseText2) {

            // After getting the response from the API, we can finally
            // add the div and change Netflix's DOM to display the score!
            json = JSON.parse(responseText2);
            addDiv(id, json.Title, json.imdbRating, json.imdbVotes);
          }
        }
      }
    }
  }
}

// Main code!
// Allows extension to observe changes to the dom.
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// The change we wish to observe.
var target = document.querySelector(".mainView");

// Define an observer that looks for a specific change.
var observer = new MutationObserver(function(mutations, observer) {

    // Fired when a mutation occurs.
    bobTitleMutation = mutations.find(mutation => mutation.target.className === 'bob-title');

    if (bobTitleMutation) {
      // Get the movie or title from the dom.
      const movieOrShowTitle = bobTitleMutation.target.textContent;

      // Display score by getting imdb score and adding to dom.
      // The function which does the HEAVY lifting!
      // Please forgive the lack of extensability :P
      getIMDbScore(movieOrShowTitle);
    }
});

// Define what element should be observed by the observer
// and what types of mutations trigger the callback.
// Main code that runs the observer.
observer.observe(target, {
  subtree: true,
  attributes: true
});

