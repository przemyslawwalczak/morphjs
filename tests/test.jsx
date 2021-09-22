function UserGreeting()
{
   if (session)
   {
      return <h1>Logged</h1>
   }

   return <h1>Not Logged</h1>
}

<page:landing>
   <head>
      <title>Test Page - {app.name}</title>

      <meta name="description" content="Free Web tutorials" />

      <script src="/public/test/script"></script>
   </head>

   <body>
      <render template="header" />

      <UserGreeting />
      
      {
         rooms.map(room =>
            <render template="room" room={room} />
         )
      }

      <render template="footer" />
   </body>
</page:landing>