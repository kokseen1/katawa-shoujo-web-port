import glob
files = (glob.glob("*.rpy"))

f = [(f.split("\\")[-1][:-4]) for f in files]
print(f)
