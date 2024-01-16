import React, { createContext, useContext, useState } from 'react';

const MessagesGlobalStateContext = createContext();

export const MessagesGlobalStateProvider = ({ children }) => {
    let [messagesData, setMessagesData] = useState([]);

    return (
        <MessagesGlobalStateContext.Provider value={{messagesData, setMessagesData}}>
            {children}
        </MessagesGlobalStateContext.Provider>
    );
}

export function MessagesGlobalState() {
    const context = useContext(MessagesGlobalStateContext);
    if (!context) {
      throw new Error('Invalid access to global state');
    }
    return context;
}