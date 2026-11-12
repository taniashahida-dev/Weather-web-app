const searchValue = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");

searchValue.addEventListener("input", function () {
  if (searchValue.value !== "") {
    searchBtn.disabled = false;
  } else {
    searchBtn.disabled = true;
  }
});
