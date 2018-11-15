import reducers from 'reducers'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'

import api from 'middlewares/api'

const middlewares = [thunk, api]

// > composeは、右から左に関数を合成する。任意の関数を引数に取り、関数を返す。引数の関数はそれぞれ一つの引数を受け取ることが想定されている。
// 関数の返り値が左隣にある関数の引数に渡され、その関数が返り値は更に左に渡されるという感じ。
// > applyMiddlewareを使うことでdispatch関数をラップし、actionがreducerに到達する前にmiddlewareがキャッチできるようにする。
export const store = compose(applyMiddleware(...middlewares))(createStore)(reducers)
