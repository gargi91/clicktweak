"use strict";

// DOM VARIABLES
const linkInput = document.querySelector(".input__link");
const inputErr = document.querySelector(".input__error");
const linkSubmitBtn = document.querySelector(".input__submit");
const navbar = document.querySelector(".navbar");
const header = document.querySelector(".header");
const loadSpinner = document.querySelector(
  ".loadingio-spinner-eclipse-8ifuwozc6d"
);
const operationWrapper = document.querySelector(".operation__wrapper");
const spinnerHelper = document.querySelector(".spinner-helper");
const operationOutputContainer = document.querySelector(".operation__output");

////////////////////////////////////////////////////////////////////////////
// Sticky navbar : using intersection observer API

const navHeight = navbar.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) navbar.classList.add("navbarsticky");
  else navbar.classList.remove("navbarsticky");
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
});

headerObserver.observe(header);
///////////////////////////////////////////////////////////////////
const outputs = [];

////////////////////////////////////////////////////////////////////
//Operation Tab

//Set session storage
const setSessionStorage = function (outputs) {
  sessionStorage.setItem("Outputs", JSON.stringify(outputs));
};

//Show loading spinner
const showLoadingSpinner = function () {
  loadSpinner.classList.remove("hide-spinner");
};

const hideLoadingSpinner = function () {
  loadSpinner.classList.add("hide-spinner");
};

//Render shortlink html
const renderOutput = function (long, short) {
  const html = `
    <div class="operation__output">
        <div class="output__input-link">
            ${long}
        </div>
        <div class="output__output-link">${short}</div>
        <button class="button button--no-transition button--dark btn-copy">Copy</button>
    </div>
  `;
  spinnerHelper.insertAdjacentHTML("afterEnd", html);
};

//Get session storage
const getSessionStorage = function () {
  if (!sessionStorage.getItem("Outputs")) return;
  const data = sessionStorage.getItem("Outputs");
  const dataArr = JSON.parse(data);
  dataArr.forEach((obj) => {
    outputs.push(obj);
    const long = obj.originalLink;
    const short = obj.shortLink;
    renderOutput(long, short);
  });
};
getSessionStorage();

//Render error output
const renderError = function (msg) {
  inputErr.textContent = msg;
  inputErr.style.display = "block";
};

linkSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  inputErr.textContent = "";
  const longLink = linkInput.value;
  if (longLink === "") {
    renderError("Please add a link");
    return;
  }
  getShortLink(longLink);
  linkInput.value = "";
});

//Link Shortener API fetch
const getShortLink = function (longLink) {
  showLoadingSpinner();
  fetch(`https://api.shrtco.de/v2/shorten?url=${longLink}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Something went wrong!(${res.status})`);
      }
      return res.json();
    })
    .then(({ result }) => {
      const long = result.original_link;
      const short = result.short_link;
      const outputObj = {
        originalLink: long,
        shortLink: short,
      };
      outputs.push(outputObj);
      setSessionStorage(outputs);
      hideLoadingSpinner();
      renderOutput(long, short);
    })
    .catch((err) => {
      hideLoadingSpinner();
      console.error(`Something went wrong!${err.message}😔😓`);
      renderError(err.message + ".");
    });
};

///////////////////////////////////////////////////////////////////
// Working on clipboard event

//Copyin to clipboard
const copyToClipboard = function (e) {
  const ele = e.target;
  if (!ele.classList.contains("btn-copy")) return;
  ele.textContent = "copied";
  ele.style.backgroundColor = "#c69963";
  const targetShortLink = ele.previousElementSibling.textContent;
  navigator.clipboard
    .writeText(`https://${targetShortLink}`)
    .then(() => {
      console.log("Copied to clipboard!!!");
    })
    .catch((err) => {
      console.error(`Failed to copy! ${err.message}`);
    });
};

operationWrapper.addEventListener("click", copyToClipboard);
