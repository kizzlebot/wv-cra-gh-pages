import React, { createContext, useState } from 'react';

export const StateContext = createContext(null);

export default function AppStateProvider(props) {
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeSinkId, setActiveSinkId] = useState('default');

  let contextValue = {
    error,
    setError,
    isFetching,
    activeSinkId,
    setActiveSinkId,
    getToken: async (identity, roomName) => {
      const headers = new window.Headers();
      const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';
      const params = new window.URLSearchParams({ identity, roomName });

      return fetch(`${endpoint}?${params}`, { headers })
        .then(res => res.text())
        .then((token) => {
          console.log('token', token)
          return token;
        })
    },
  };


  const getToken = (name, room) => {
    setIsFetching(true);
    return contextValue
      .getToken(name, room)
      .then(res => {
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  return (
    <StateContext.Provider
      value={{ ...contextValue, getToken }}
    >
      {props.children}
    </StateContext.Provider>
  )
};