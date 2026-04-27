Zirconium Application
===

The Zirconium Application is the main entry point of the Zirconium framework.
It is responsible for creating and managing all the Zirconium objects.
There are two main types of objects:
- UI objects: ZirconWindow, ZirconDesktop, ZirconDesktopManager
- Core objects: Business data, Storage, Database managers,  ...

Eample for logging: 
A logger object is a core object. It is responsible for logging messages.
It may exist a UI Object that is responsible for displaying the log messages to the user.
The UI object(s) listen to the logger events and update its(their) rendering accordingly.

# UI objects

UI objects are mainly responsible of emitting change requests to Core objects.
They possibly may handle them for user experience...
They listen to Core Events to update their state and their rendering.

# Core objects

Core objects are responsible for handling change requests and updating their state (or not)
They are not responsible for rendering anything.
They emit events to notify UI objects that their state has changed (so that they may update their rendering).

# Events
 ## requests
 finish with _REQUEST

 ## Actions
 Those are the events emitted by the core objects to notify that they are handling a request, but it may take some time before it is completed.
 finish with _INPROGRESS

 ## Notifications
 finish with _DONE


