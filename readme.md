# Katawa Shoujo Web Port

![Screenshot](https://raw.githubusercontent.com/kokseen1/ks-web-client/main/assets/ui/sd-emi-c.png)
![Screenshot](https://raw.githubusercontent.com/kokseen1/ks-web-client/main/assets/ui/sd-hanako-c.png)
![Screenshot](https://raw.githubusercontent.com/kokseen1/ks-web-client/main/assets/ui/sd-lilly-c.png)
![Screenshot](https://raw.githubusercontent.com/kokseen1/ks-web-client/main/assets/ui/sd-rin-c.png)
![Screenshot](https://raw.githubusercontent.com/kokseen1/ks-web-client/main/assets/ui/sd-shizune-c.png)

Because this is an easy (enough) visual novel to reverse and reimplement.

## Features
- Minimal to no modification of original source code required
- Functional choice system
- Functional affection points system
- Most visuals are working (>80%)
- Save/load
- Skip text

## Known Bugs
- Skipping text too quickly will cause sprites to disappear/appear before they are supposed to or at wrong places. Mostly because of the jQuery fade function having race conditions.
- The log is not working as it should. Might need to implement using a stack data structure.
- Two sprites can occupy the same position at once.
- There are probably lots of visual bugs not yet fixed.

## Not yet implemented
- Animations, effects, video, etc.
- Proper log implementation
- Multiple save slots
- All routes
