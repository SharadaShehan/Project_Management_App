import React, { createContext, useContext, useState } from 'react';

const UserGlobalStateContext = createContext();

export const UserGlobalStateProvider = ({ children }) => {
    let [userData, setUserData] = useState({
        id: null,
        firstName: null,
        lastName: null,
        username: null
    });

    return (
        <UserGlobalStateContext.Provider value={{userData, setUserData}}>
            {children}
        </UserGlobalStateContext.Provider>
    );
}

export function UserGlobalState() {
    const context = useContext(UserGlobalStateContext);
    if (!context) {
      throw new Error('Invalid access to global state');
    }
    return context;
}
