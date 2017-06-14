# get the strongSwan tarball
wget http://download.strongswan.org/strongswan-5.5.3.tar.bz2
# extract
tar xjf strongswan-5.5.3.tar.bz2
cd strongswan-5.5.3

# build strongswan with all required options to match algo
./configure -sysconfdir=/etc -prefix=/usr -libexecdir=/usr/lib \
-disable-aes -disable-des -disable-md5 -disable-sha1 -disable-sha2 \
-disable-fips-prf -disable-gmp -enable-openssl -enable-agent \
-enable-eap-gtc -enable-eap-md5 -enable-eap-mschapv2 -enable-eap-identity
make
# install 
make install