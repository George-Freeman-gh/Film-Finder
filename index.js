// initialises localStorage with an empty array to push movies to.
if (localStorage.getItem("watchlist") === null) {
  localStorage.setItem("watchlist", JSON.stringify([]));
}

const form = document.getElementById("form");
const searchEL = document.getElementById("search-input");
const feed = document.getElementById("feed");
const watchlistFeed = document.getElementById("watchlist-feed");
const movieIdArray = [];
const watchlist = JSON.parse(localStorage.getItem("watchlist"));




let page = 1;
let searchedTitle = "";
let pageStorage = [];





//Fetches a serach to the movie database and maps the returned array to provide an array of only the imdbId's

const getImdbIds = async (movieTitle, page) => {
  feed.innerHTML = `<div class="loader"></div>`
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=3dce0b9&s=${movieTitle}&page=${page}&type=movie`
  );
  const data = await response.json();

  if (data.Search) {
    
    return data.Search.map((movie) => movie.imdbID);
  } 
};

// This function is used to render the movie data onto the feed element.

const renderPage = (pageStorage) => {
  
  const currentPage = page - 1;

  if (pageStorage[currentPage]) {

      feed.innerHTML = pageStorage[currentPage]
    .map((movie) => {
    const isInWatchlist = watchlist.find((watchlistMovie) => watchlistMovie.imdbID === movie.imdbID);
     const buttonClass = isInWatchlist ? 'fa-solid fa-circle-minus' : 'fa-solid fa-circle-plus';
     const buttonData = isInWatchlist ? "remove" : "add";



      return `<div class="movie-container" >
                    <div class="poster-container">
                        <img src="${movie.Poster}" onerror="this.src='./Images/poster-unavailable.png'" alt="Movie Poster of the film: ${movie.Title}">
                    </div>
                    <div class="movie-body">
                      <div class="movie-name">
                        <h5 class="movie-title">${movie.Title}</h5>
                          <i class="fa-solid fa-star" style="color: #ffd91a;"></i>
                          <h5 class="movie-rating">${movie.imdbRating}</h5>
                      </div>
                      <div class="movie-more">
                        <h5>${movie.Runtime}</h5>
                        <h5>${movie.Genre}</h5>
                        <div  class="watch-flex">
                        <button class="icon-buttons">
                          <i id="${movie.imdbID}" class="${buttonClass} ${buttonData}" style="color: #ffffff;" data-button=${buttonData}></i>
                        </button>
                          <h5>${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</h5>
                        </div>
                      </div>
                      <div class="movie-desc">
                        <p  id="movie-plot" class="movie-plot">${movie.Plot === "N/A" ?
                         "The description for this Movie is currently Unavailable." : 
                         movie.Plot}</p>
                      </div>
                    </div>
                    
              </div>`;
    })
    .join("");

   

    if (currentPage > 0) {
      feed.innerHTML += `<footer>
      <button class="page-btn" id="previous-page">Previous Page</button>
      <button class="page-btn" id="next-page">Next Page</button> 
    </footer>`
    } else {

      feed.innerHTML += `
      <footer>
        
        <button class="page-btn" id="next-page">Next Page</button> 
      </footer>
      `
      
    }

    const nextPageButton = document.getElementById("next-page");
    const previousPageButton = document.getElementById("previous-page");

    nextPageButton.addEventListener("click", () => {
      page++;
      if (!pageStorage[page - 1]) {
        getMovieData();
        window.scrollTo(0,0);
      
      } else {
        renderPage(pageStorage);
        window.scrollTo(0,0);
      }
      
    })

    if (previousPageButton) {

      previousPageButton.addEventListener("click", () => {

        if (currentPage > 0) {
          page--;
          renderPage(pageStorage);
          
        }
        window.scrollTo(0,0);
        
        
    
 
    

  })

    }

   

  }


};

//calls the getImdbIds function and awaits the array. It then fetches the movie data for each Id in the array.
// When the movie data has arrived it is pushed into a temporary array representing a page.
//the temporary page is then pushed into the global page storage array.
//each page is saved and can be used when user clicks previous page.

const getMovieData = async () => {
  const array = await getImdbIds(searchedTitle, page);
  if (array) {
    const fetches = array.map((id) =>
      fetch(`https://www.omdbapi.com/?apikey=3dce0b9&i=${id}&plot=short`)
    );
    const responses = await Promise.all(fetches);
    const data = await Promise.all(responses.map((res) => res.json()));
    pageStorage.push(data);
    renderPage(pageStorage);
  } else {
    feed.innerHTML = `
    <div class="empty-watchlist">
      <h5> Unable to find Movies, Please try another title. </h5>
    </div>
    `;
  }
};



if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feed.innerHTML = `<div class="loader"></div>`
    const formData = new FormData(form);
    searchedTitle = formData.get("search-input");
    pageStorage = [];
    page = 1;
    searchEL.value = "";
    getMovieData();
    document.activeElement.blur();
  });
}

if (feed) {
  feed.addEventListener("click", (event) => {
    if (event.target.dataset.button === "add") {
      let currentPage = page - 1;
      
      /*  this if statement checks the watchlist to see if the movie is in the array. 
        Prevents movies being added twice to the watchlist array. */
      if (!watchlist.find((movie) => movie.imdbID === event.target.id)) {
        
        /* Finds the index of the movie in the storage */
        let movieIndex = pageStorage[currentPage].findIndex(
          (movie) => movie.imdbID === event.target.id
        );
        /*push the selected movie into the watchlist array*/
        watchlist.unshift(pageStorage[currentPage][movieIndex]);
        // update localStorage with the latest version of watchlist array
        localStorage.setItem("watchlist", JSON.stringify(watchlist));

        renderPage(pageStorage);
        

      
      }
    } else if (event.target.dataset.button === "remove") {
      removeFromWatchlist(event);
      renderPage(pageStorage);
 
    }
  });
}

const renderWatchlist = () => {
  if (watchlistFeed && watchlist[0]) {
    watchlistFeed.innerHTML = watchlist
      .map((movie) => {
        return `<div class="movie-container" >
                    <div class="poster-container">
                        <img src="${movie.Poster}" onerror="this.src='./Images/poster-unavailable.png'" alt="Movie Poster of the film: ${movie.Title}">
                    </div>
                    <div class="movie-body">
                      <div class="movie-name">
                        <h5 class="movie-title">${movie.Title}</h5>
                          <i class="fa-solid fa-star" style="color: #ffd91a;"></i>
                          <h5 class="movie-rating">${movie.imdbRating}</h5>
                      </div>
                      <div class="movie-more">
                        <h5>${movie.Runtime}</h5>
                        <h5>${movie.Genre}</h5>
                        <div  class="watch-flex">
                          <i id="${movie.imdbID}" class="fa-solid fa-circle-minus" style="color: #ffffff;" data-button="remove"></i>
                          <h5>Remove</h5>
                        </div>
                      </div>
                      <div class="movie-desc">
                      <p  id="movie-plot" class="movie-plot">${movie.Plot === "N/A" ?
                      "The description for this Movie is currently Unavailable." : 
                      movie.Plot}</p>
                      </div>
                    </div>
                    
              </div>`;
      })
      .join("");
  } else {
    watchlistFeed.innerHTML = `
    <div class="empty-watchlist">
      <h5>Your watchlist is looking a little empty...</h5>
      <div>
        <a class="add-movies" href="./index.html">
            <i class="fa-solid fa-circle-plus" style="color: #ffffff;"></i>
            <h6>Let's add some movies!</h6>
        </a>
  
    </div>
    
  
    
  
  
    </div>`;
  }

  
};


//checks if watchlistFeed is currently loaded
if (watchlistFeed) {

  // renders the current watchlist
  renderWatchlist();

  // add a click event listener to the watchlist feed to be able to detect when and which movie to remove;
  watchlistFeed.addEventListener("click", (event) => {
    if (event.target.dataset.button === "remove") {
      
      removeFromWatchlist(event);
      
      // render watchlist again to show the updated array of movies.
      renderWatchlist();
    }
  });
}

const  removeFromWatchlist = (event) => {

  if (event.target.dataset.button === "remove") {
    // returns an array without the removed movie
    watchlist.splice(
      watchlist.findIndex((movie) => movie.imdbID === event.target.id),
      1
    );

    // update local storage with the new updated array
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    
    
  }
  



}

