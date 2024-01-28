import React from "react";

export default function App() {
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
  function getReviewURL(ACN) {
    const firstPart = "https://www.amazon.in/product-reviews/";
    const secondPart =
      "/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=1";
    return firstPart + ACN + secondPart;
  }
  const getReviews = async () => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const tab = tabs[0].url;
      const ACN = getasin(tab);
      if (!ACN) {
        alert("Sorry, this website is currently not supported");
        return;
      }
      const obj = { startScraping: ACN, scrapingLimit: 100 };
      chrome.storage.local.set(obj, function () {
        chrome.tabs.create({ url: getReviewURL(ACN) });
      });
    });
  };
  return (
    <main className="h-screen grid place-items-center">
      <button className="bg-blue-400 px-6 py-2 text-white" onClick={getReviews}>
        Analyse Reviews
      </button>
    </main>
  );
}
