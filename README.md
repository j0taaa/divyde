# divyde

This app is going to be used to keep track of debt between friends in groups of friends

There is going to be a website and an app for it (both on this repository). For web, it uses NextJS and, for the app, it uses react native with expo

On it, there will be the possibility to have groups and have debt with individual people. 

There will be the offline and online sections of the app. For the offline, just the user has access to the debts that he is adding. He adds the debt and the reason of it and the data is kept offline

For the online, there will be logged in users that can create debts between each other and inside of groups, and data is available to everyone in the group or for the user

Also there will be a feature to equalize the debt graph. this means if there is a debt cycle, it will make the maximum flow algorithm

Use containers for the architecture (using postgresql database and the nextjs server(separate containers))

Use tailwind, and, for the web, use shadcn/ui
