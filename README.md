# Introduction
This application offers functions that may run automatically every time one or more specimens of an item is received.

# Installation
You install the application from the connection view in Thetis IMS. The name of the application is 'thetis-ims-order-reception-utilities'.

# Configuration
In the data document of the context:
```
{
  "ReceptionUtilities": {
    "assignLocationToItem": true
  }
}
```

# Options

#### assignLocationToItem

Consider the location at which the specimens have been received. Assume that the item in question does not already have a location. In that case the location is assigned to the item.



