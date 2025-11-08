"use client"
import React from 'react'
import ItemAuthenticator from './itemAuthenticator'
import ItemRegistration from './itemRegistration'

export default function MainRouter() {
  return (
    <main>
      <ItemRegistration />
      <ItemAuthenticator />
    </main>
  )
}
