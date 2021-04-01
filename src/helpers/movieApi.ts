import axios from 'axios'
import { MovieInterface } from '../models/Movie'

const { API_KEY } = process.env;

/** Response object from the API server */
interface MovieObjectRes {
  Title: string
  Released: string
  Genre: string
  Director: string
}

/**
 * Function to fetch the data about a movie
 * @param title - Movie title to search for
 * @returns 
 */
const fetchMovieDetails = async (title: string) => {
  try {
    const res = await axios.get<MovieObjectRes>(`http://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`)
    const movie: MovieInterface = {
      title: res.data.Title,
      released: new Date(res.data.Released),
      genre: res.data.Genre,
      director: res.data.Director,
    }
    return movie
  } catch (err) {
    return null
  }
}

export { fetchMovieDetails }