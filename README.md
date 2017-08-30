# digital-recovery

Google Maps prototype to find recovery meetings

### Background ###

Today, most online directories of "recovery" meetings (such as AA, NA, Al-Anon, etc) have poor user experience, such
as the Los Angeles AA Central Office site: https://lacoaa.org/find-a-meeting/.  This prototype explores how this exact
same data can be presented with a user experience that places a priority on finding relevant results with minimal
friction.

### Tech Approach ###

User researched showed that meeting attendants mostly followed either of 2 habits -- either their meeting schedule was
already planned for the week or they were searching for something last minute based on the current time and place.
Because the existing web interfaces are very poor for the latter behavior, this prototype aims to solve for this
use case by focusing on a fast mobile-friendly interface whose filtering system adds minimal friction.

This resulted in the attempt to produce solution that is centered on a GoogleMaps interface while not requiring a
native app download.  In order to accomplish this, UI elements were chosen for their ability to give a native-like
"snappy" experience.

The data itself was extracted by parsing the aforementioned LACOAA using CheerioJS.  The data then undergoes a process
that does 2 key transformations:

1) Address text is run through GoogleMaps GeoCode API to find and store map coordinates
2) Time text is copied into the format that MongoDB needs in order to do operations

Since the core data rarely changes, these elements greatly improve efficiency by not having to be done in real-time
with every query.  The coordinates also enable us to easily use the GoogleMaps visible area as part of the data filter
in order to avoid the excess resource consumption that would be required if map points were being rendered off-screen.
This is especially essential for a smooth mobile experience.

### Stack Summary ###

This prototype uses a combination of MongoDB + ExpressJS + AngularJS (v1) + NodeJS (MEAN stack).

The ExpressJS framework serves both the main web interface as well as the REST API.  A Docker-Compose configuration is
provided for simple setup and is used in this manner in the production environment in combination with NGINX which
provides a reverse proxy.

### Who do I talk to? ###

Ray Dollete <ray@raytalkstech.com>