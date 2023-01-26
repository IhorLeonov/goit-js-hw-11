// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову.

import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { FindPictureApi } from './js/search-picture-API';

const searchForm = document.querySelector('#search-form');
const galleryBox = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
const buttonUp = document.querySelector('.js-up-btn');
const findPictureApi = new FindPictureApi();
const observOptions = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let observer = new IntersectionObserver(infinityScroll, observOptions);
searchForm.addEventListener('submit', onSearchClick);
buttonUp.addEventListener('click', scrollUp);

function onSearchClick(evt) {
  evt.preventDefault();
  findPictureApi.resetPage();
  findPictureApi.quary = searchForm.searchQuery.value.trim();
  buttonUp.style.display = 'none';

  if (!findPictureApi.quary) {
    emptyInputMessage();
    return;
  }
  findPictureApi
    .pixabayApi()
    .then(({ hits, totalHits }) => {
      if (totalHits === 0) {
        badRequestMessage();
        return;
      }
      resetMarkup();
      goodRequestMessage(totalHits);
      createImageMarkup(hits);
      observer.observe(guard);
    })
    .catch(err => console.log(err.message));
}

function infinityScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      buttonUp.style.display = 'flex';
      findPictureApi.incrementPage();
      findPictureApi
        .pixabayApi()
        .then(({ hits, totalHits }) => {
          createImageMarkup(hits);
          smoothScroll();
          hideButton();
          if (
            findPictureApi.page ===
            Math.ceil(totalHits / findPictureApi.perPage)
          ) {
            endCollectionMessage();
            observer.unobserve(guard);
          }
        })
        .catch(err => console.log(err.message));
    }
  });
}

function createImageMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
    <div class="gallery__item">
    <a class="gallery__link" href="${largeImageURL}">
    <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
    <div class="info">
    <ul class="info-list list">
      <li class="info__item">
        <p><b>Likes</b></p>
        <p>${likes}</p>
      </li>
      <li class="info__item">
        <p><b>Views</b></p>
        <p>${views}</p>
      </li>
      <li class="info__item">
        <p><b>Comments</b></p>
        <p>${comments}</p>
      </li>
      <li class="info__item">
        <p><b>Downloads</b></p>
        <p>${downloads}</p>
      </li>
    </ul>
  </div>
  </div>`
    )
    .join('');

  // background-image: none;
  galleryBox.insertAdjacentHTML('beforeend', markup);
  summonSimpleLightbox();
}

function endCollectionMessage() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function badRequestMessage() {
  Notiflix.Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
}

function goodRequestMessage(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function emptyInputMessage() {
  Notiflix.Notify.info('Please, type something!');
}

function resetMarkup() {
  galleryBox.innerHTML = '';
}

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  buttonUp.style.display = 'none';
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function summonSimpleLightbox() {
  const options = {
    captionsData: 'alt',
    captionDelay: 250,
  };
  const lightbox = new SimpleLightbox('.gallery a', options);
  lightbox.refresh();
}

function hideButton() {
  setTimeout(() => {
    buttonUp.style.display = 'none';
  }, 15000);
}
