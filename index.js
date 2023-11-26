const form = document.getElementById("form");
const searchEL = document.getElementById("search-input");
const feed = document.getElementById("feed");

let page = 1;
let searchedTitle = "";
const movieIdArray = [];
let pageStorage = [];

//Fetches a serach to the movie database and maps the returned array to provide an array of only the imdbId's

const getImdbIds = async (movieTitle, page) => {
  const response = await fetch(
    `http://www.omdbapi.com/?apikey=71102a61&s=${movieTitle}&page=${page}`
  );
  const data = await response.json();
  return data.Search.map((movie) => movie.imdbID);
};

// This function is used to render the movie data onto the feed element.

const renderPage = (pageStorage) => {
  const currentPage = page - 1;
  feed.innerHTML = pageStorage[currentPage]
    .map((movie) => {
      return `<div class="movie-container">
                    <div class="poster-container">
                        <img src="${movie.Poster}" alt="Movie Poster of the film: ${movie.Title}">
                    </div>
                    <div class="movie-body">
                        <h5 class="movie-title">${movie.Title}</h5>
                        <p class="movie-plot">${movie.Plot}</p>
                    </div>
                    
              </div>`;
    })
    .join("");
};

//calls the getImdbIds function and awaits the array. It then fetches the movie data for each Id in the array.
// When the movie data has arrived it is pushed into a temporary array representing a page.
//the temporary page is then pushed into the global page storage array.
//each page is saved and can be used when user clicks previous page.

const getMovieData = async () => {
  const array = await getImdbIds(searchedTitle, page);
  const fetches = array.map((id) =>
    fetch(`http://www.omdbapi.com/?apikey=71102a61&i=${id}&plot=short`)
  );
  const responses = await Promise.all(fetches);
  const data = await Promise.all(responses.map((res) => res.json()));
  pageStorage.push(data);
  renderPage(pageStorage);
  console.log(pageStorage);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  searchedTitle = formData.get("search-input");
  pageStorage = [];
  searchEL.value = "";
  getMovieData();
});
