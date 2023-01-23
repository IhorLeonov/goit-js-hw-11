import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '32998270-2baa29d20b34632b2d37a1874';

export class ImgApiService {
  constructor() {
    this.searchQuary = '';
    this.page = 1;
    this.perPage = 40;
  }

  async pixabayApi() {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${this.searchQuary}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${this.perPage}&page=${this.page}`
    );
    return response.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get quary() {
    return this.searchQuary;
  }

  set quary(newQuary) {
    this.searchQuary = newQuary;
  }
}
