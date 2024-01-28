function openModal() {
  document.body.innerHTML += `
    <div class="scraper-info-modal">
        <div id="modal-content" class="modal-content">
            <h1>Reviews Scraped: 
                        <span id="scraper-modal-content"></span>
            </h1>
        </div>
    </div>
    `;
}

chrome.storage.local.get(["startScraping", "scrapingLimit"], function (result) {
  const { startScraping, scrapingLimit } = result;
  if (startScraping && getasin(window.location.href) == startScraping) {
    openModal();
    updateModal();
    startScrapingReviews(scrapingLimit);
  } else {
    resetStorage();
  }
});

function updateModal() {
  document.getElementById("scraper-modal-content").innerText =
    getScrapedCount();
}

function getScrapedCount() {
  let count = localStorage.getItem("scrapedReviews");
  if (count) count = JSON.parse(count).length;
  else count = "0";
  return count;
}

function startScrapingReviews(limit) {
  const elements = document.querySelectorAll("[data-hook=review]");
  if (limit) limit = Number(limit);
  else limit = 1000000000;
  if (elements.length && limit > Number(getScrapedCount())) {
    elements.forEach((item) => {
      scrapeReview(item);
      updateModal();
    });
    goToNextReviewPage();
  } else {
    saveScrapedReviews();
    resetStorage();
  }
}

function scrapeReview(element) {
  try {
    const review = {
      reviewerName: element.querySelector("span.a-profile-name")?.innerText,
      stars: element
        .querySelector("[data-hook=review-star-rating]")
        ?.innerText.split(" ")[0],
      reviewLink:
        "https://www.amazon.in/" +
        element
          .querySelector("[data-hook=review-title]")
          .getAttribute("href")
          .replace(",", " "),
      reviewTitle: element
        .querySelector("[data-hook=review-title]")
        ?.innerText.replace(",", " "),
      reviewMeta: element
        .querySelector("[data-hook=review-date]")
        ?.innerText.replace(",", " "),
      review: JSON.stringify(
        element.querySelector("[data-hook=review-body] span").innerText
      ).replace(",", " "),
    };

    addToReviewList(review);
  } catch (e) {
    console.log(e);
  }
}

function addToReviewList(review) {
  let scrapedReviews = localStorage.getItem("scrapedReviews");
  if (scrapedReviews) scrapedReviews = JSON.parse(scrapedReviews);
  else scrapedReviews = [];
  scrapedReviews.push(review);
  localStorage.setItem("scrapedReviews", JSON.stringify(scrapedReviews));
}

function getasin(url) {
  const urlobjects = url.split("/");
  let i;
  let newasin;
  for (i = 0; i < urlobjects.length; i++) {
    if (
      urlobjects[i].substring(0, 10) ==
      urlobjects[i].toUpperCase().substring(0, 10)
    ) {
      newasin = urlobjects[i].substring(0, 10);
    }
  }
  return newasin;
}

function resetStorage() {
  localStorage.removeItem("scrapedReviews");
  chrome.storage.local.clear();
}

function goToNextReviewPage() {
  const url = new URL(window.location);
  const searchQuery = getUrlParams(url.search);
  searchQuery["pageNumber"] = String(Number(searchQuery["pageNumber"]) + 1);
  let newSearch = "?";
  for (let prop in searchQuery) {
    newSearch += `${prop}=${searchQuery[prop]}&`;
  }
  newSearch = newSearch.slice(0, -1);
  window.location = `${url.origin}${url.pathname}${newSearch}`;
}

function getUrlParams(search) {
  const hashes = search.slice(search.indexOf("?") + 1).split("&");
  const params = {};
  hashes.map((hash) => {
    const [key, val] = hash.split("=");
    params[key] = decodeURIComponent(val);
  });
  return params;
}

async function saveScrapedReviews() {
  const scrapedReviews = JSON.parse(localStorage.getItem("scrapedReviews"));
  document.getElementById("modal-content").innerHTML =
    "<h1>Analysing Reviews ...</h1>";

  const response = await fetch("http://127.0.0.1:5000/analyze-reviews", {
    method: "POST",
    body: JSON.stringify({ reviews: scrapedReviews }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log(data);

  document.getElementById("modal-content").innerHTML = `
  <div class="flex-col">
    <h1>Review Analysis</h1>
    <h2>Summary</h2>
    <h3>Corrected Rating : ${data.corrected_ratings} / 5</h3>
    <div>${data.summary}</div>
  </div>
  <br>
  <h2>Reviews</h2>
  <br>

  <ul id="reviews_filtered" class="flex-col"></ul>
  `;
  data.filtered.forEach(
    (review) =>
      (document.getElementById(
        "reviews_filtered"
      ).innerHTML += `<li> <h4> <a href=${review.reviewLink}> ${review.reviewTitle} - ${review.reviewerName}</a> - ${review.stars} (${review.reviewMeta})</h4> <p>${review.review}</p> </li>`)
  );
}
