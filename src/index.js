// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову.

import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { FindPictureApi } from './js/search-picture-API';

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryBox: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
  buttonUp: document.querySelector('.js-up-btn'),
  bgImage: document.querySelector('.bg-image'),
};

const options = {
  captionsData: 'alt',
  captionDelay: 250,
};
let lightbox = new SimpleLightbox('.gallery a', options);

const observOptions = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};
let observer = new IntersectionObserver(infinityScroll, observOptions);

const findPictureApi = new FindPictureApi();
refs.searchForm.addEventListener('submit', onSearchClick);
refs.buttonUp.addEventListener('click', scrollUp);
refs.searchForm.searchQuery.addEventListener('input', hideBtnUp);

async function onSearchClick(evt) {
  evt.preventDefault();
  try {
    findPictureApi.resetPage();
    findPictureApi.quary = refs.searchForm.searchQuery.value.trim();
    hideBtnUp();

    if (!findPictureApi.quary) {
      emptyInputMessage();
      resetMarkup();
      addBgImg();
      observer.unobserve(refs.guard);
      return;
    }
    const { hits, totalHits } = await findPictureApi.pixabayApi();

    if (totalHits === 0) {
      resetMarkup();
      badRequestMessage();
      observer.unobserve(refs.guard);
      addBgImg();
      hideBtnUp();
      return;
    }
    resetMarkup();
    goodRequestMessage(totalHits);
    createImageMarkup(hits);
    removeBgImg();
    observer.observe(refs.guard);
  } catch (error) {
    console.log(error.message);
  }
}

async function infinityScroll(entries, observer) {
  try {
    entries.forEach(async entry => {
      if (entry.isIntersecting) {
        findPictureApi.incrementPage();

        const { hits, totalHits } = await findPictureApi.pixabayApi();

        if (
          findPictureApi.page === Math.ceil(totalHits / findPictureApi.perPage)
        ) {
          endCollectionMessage();
          observer.unobserve(refs.guard);
        }
        createImageMarkup(hits);
        if (totalHits > findPictureApi.perPage) {
          refs.buttonUp.style.display = 'flex';
          smoothScroll();
        }
      }
    });
  } catch (error) {
    console.log(error.message);
  }
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
  refs.galleryBox.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function endCollectionMessage() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function resetMarkup() {
  refs.galleryBox.innerHTML = '';
}

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  refs.buttonUp.style.display = 'none';
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

function hideBtnUp() {
  refs.buttonUp.style.display = 'none';
}

function addBgImg() {
  refs.bgImage.classList.add('bg-image');
  refs.bgImage.classList.remove('bg-image-none');
}

function removeBgImg() {
  refs.bgImage.classList.remove('bg-image');
  refs.bgImage.classList.add('bg-image-none');
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

// function runSimpleLightbox() {
//   const options = {
//     captionsData: 'alt',
//     captionDelay: 250,
//   };
//   let lightbox = new SimpleLightbox('.gallery a', options);
//   return lightbox;
// }

// function runIntersectionObserver() {
//   const observOptions = {
//     root: null,
//     rootMargin: '300px',
//     threshold: 0,
//   };
//   let observer = new IntersectionObserver(infinityScroll, observOptions);
//   return observer;
// }
