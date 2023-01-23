// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову.
// Форма изначально есть в HTML документе. Пользователь будет вводить строку для поиска в текстовое поле, а при сабмите формы необходимо выполнять HTTP-запрос.
// В качестве бэкенда используй публичный API сервиса Pixabay.
// ✅ 1. Зарегистрируйся, получи свой уникальный ключ доступа и ознакомься с документацией.
// 3. Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло.
// В таком случае показывай уведомление с текстом "Sorry, there are no images matching your search query. Please try again.".
// ✅ 4. При поиске по новому ключевому слову необходимо полностью очищать содержимое галереи, чтобы не смешивать результаты.
// ✅ 5. Pixabay API поддерживает пагинацию и предоставляет параметры page и per_page.
// ✅ Сделай так, чтобы в каждом ответе приходило 40 объектов(по умолчанию 20).
// ✅ 5.1 Изначально значение параметра page должно быть 1.
// ✅ 5.2 При каждом последующем запросе, его необходимо увеличить на 1.
// ✅ 5.3 При поиске по новому ключевому слову значение page надо вернуть в исходное.
// ✅ 6.5 Если пользователь дошел до конца коллекции выводи уведомление с текстом: "We're sorry, but you've reached the end of search results.".
// ✅ 7. После первого запроса при каждом новом поиске выводить уведомление в котором будет написано сколько всего нашли изображений (свойство totalHits).
// Текст уведомления "Hooray! We found totalHits images."
// ✅ 8. Добавить отображение большой версии изображения с библиотекой SimpleLightbox для полноценной галереи.
// ✅ 9. Сделать плавную прокрутку страницы после запроса и отрисовки каждой следующей группы изображений.
// ✅ 10. Вместо кнопки «Load more» можно сделать бесконечную загрузку изображений при прокрутке страницы.

// import axios from 'axios';
import Notiflix from 'notiflix';
import { debounce } from 'lodash';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ImgApiService } from './search-img-service';

const searchForm = document.querySelector('#search-form');
const galleryBox = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
const imgApiService = new ImgApiService();
const observOptions = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};
let observer = new IntersectionObserver(onLoadMore, observOptions);
let totalHits = '';

searchForm.addEventListener('submit', onSearchClick);

function onLoadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      imgApiService.incrementPage();
      imgApiService
        .pixabayApi()
        .then(data => {
          createImgMarkup(data.hits);
          smoothScroll();
          if (
            imgApiService.page ===
            Math.ceil(data.totalHits / imgApiService.perPage)
          ) {
            observer.unobserve(guard);
            ImageIsOverMassege();
          }
        })
        .catch(err => console.log(err.message));
    }
  });
}

function createImgMarkup(arr) {
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
    <div class="photo-card">
    <a class="gallery__item" href="${largeImageURL}">
    <img class="img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
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

  galleryBox.insertAdjacentHTML('beforeend', markup);
  summonSimpleLightbox();
}

function summonSimpleLightbox() {
  const options = {
    // captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  };
  const lightbox = new SimpleLightbox('.gallery a', options);
  lightbox.refresh();
}

function firstSearchMassege(totalHits) {
  if (totalHits) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

function resetMarkup() {
  galleryBox.innerHTML = '';
}

function onSearchClick(evt) {
  evt.preventDefault();
  imgApiService.quary = searchForm.searchQuery.value.trim();
  imgApiService.resetPage();
  resetMarkup();

  imgApiService
    .pixabayApi()
    .then(data => {
      createImgMarkup(data.hits);
      observer.observe(guard);
      totalHits = data.totalHits;
      firstSearchMassege(totalHits);
    })
    .catch(err => console.log(err.message));
}

function ImageIsOverMassege() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
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
