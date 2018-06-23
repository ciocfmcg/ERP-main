# libreERP

I started this project in August of 2015.

I dont know why but then I decided to build it further to a project management platform mainly focused on electronics and CAD projects. In the most matured state of this project there will be every single module of an ERP including full integration of kiCAD, FreeCAD, libreOffice and Blender.

The current state of the project is as follows :

1. The basic authentication with admin interface to manage users and their master data is almost complete.
2. A realtime notification system based on Autobahn and Crossbar.io project is also incorporated which also made it possible to build a realtime chat system.
3. In terms of collaboration and people's profile system I have implemented almost 50 % of what Facebook can do. Posting a post, album, photos with comments and like system is also working fine.
4. Calendar with meeting , todo and reminders is working fine
5. blogging is ready
6. An API backed IMAP-SMTP web email client is looking great, I am facing issue in authenticating the Dovecot IMAP server with the Django's user data. The workaround I am using is that for each user the system will use proxy login to retrieve the mails and return the JSON response.
7. a github like portal that is focused on providing secure system to host git repos is working fine. The users can also browse the files and commits diffs from the web interface. Real time comments on code diff is awesome. You can discuss without leaving the window or refreshing it. This part of the project is using gitolite as authorization layer and gitPython for for python-git data fetching.
8. A public blogging site which can help people share articles without being in the ERP network. Login is required to read the full article.
9. A command line interface for the gitolite for authentication is available at http://github.com/pkyad/libreERP-cli
10. Android APP for task management and Chat app is also available, please browse my profile for AndroidConnector project. Branch Wamp is for TaskBoard and chat is for Chat system.
11. Desktop application based on pyQT for finance module to upload invoiced directly from HP scanners or PDF files is available at http://github.com/pkyad/libreERP-docScanner
12. CRM module's contact management is complete , deals and other part is on it way.

Ongoing work
------------
Currently working on finance module which will take care of inbound and outbound expenses. The closest example can be Concur.


> The best part of the project is that the architecture I designed for this project is absolutely state of the art. Its uses RESTful API interaction, Angular JS based interactive and responsive frontend makes it fun to work on and more importantly enjoyable to the users.

Feel free to contact me at pkyisky@gmail.com if you have any doubt or question.

I would be very happy if you can help me build this further. I am planning next to build the 3D rendering engine backed by GIT version control for the CAD project management module.

Installation guide for this project is as follows:

The backend is Django powered so you can install it on either of windows or GNU/linux environment. I would recommend GNU/linux as you will be able to run the WAMP router server on the same machine.

### Build guide
-------------

Run the following commands in your console / command prompt with super user privileges or in virtualenv::

    $ pip install -r requirements.pip

in order to install Crossbar.io router server please head to the Crossbar.io website however here are steps which on the day when I wrote this document worked (For installation on windows please refer http://crossbar.io)

    $ apt-get install python-dev
    $ apt-get install libffi-dev
    $ apt-get install libssl-dev
    $ pip install crossbar[all]

### WAMP server configuration
-----------------------------


You can initiate a WAMP server using::

    $ sudo crossbar init


This will create a config.json file in in your /home/{{username}}/.crossbar  folder.
We need to replace the content of the config.json with the settings in {{project folder}}/.crossbar/config.json file

Now you can start the WAMP server with::

    $ sudo crossbar start

You also need to set the WAMP_SERVER ip address in the ../libreERP/libreERP/settings.py

### Git server
---------------
I am using gitolite for GIT repo hosting. On a system with root run the script and pass root as argumanet. Eg.

    $ sudo python setupScripts/gitolite.py root

This will create a git user on the machine. Now switch the user using  `su - git` and run the following command

    $ python [path of the gitolite.py used earlier] git

in both the above command the system will ask you some questions like password for new user , path of the ssh key etc etc. just keep pressing enter for those.

Few steps are given in setupScripts/gitolite.py file. Please complete them too. Those are for linking the gitolite and the ERP server.

### Demo
------
 If you want my help to get the server installed please contact me. I will try my best to provide full support.

You can checkout the source code. The source is licensed as per the terms and conditions of GPL 2. Build instructions are very easy to follow and within 10 minutes (on linux) you can have the environment up and ready. The DB is SQLite and already in the project folder but in the settings you can comment out the SQLite part and uncomment the DB connection settings for MySQL

Once setup you can run::

    $ python manage.py runserver


this will host the app on localhost and can be browsed at http://localhost:8000/login

login with id : "pradeep" , password : "123"


License
----

GPL2


Errors and solutions
--------------------
if getting error like jpeg is required during the installation of pillow:

    $ sudo apt-get install libtiff5-dev libjpeg8-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk python-dev libffi-dev

if getting error like git repositories directory not found means that www-data user which is for the apache is not able to access the `/home/git/repositories/`. You can give permission like this:

    $root@vps:/home/git/libreERP-main# sudo find /home/git/repositories/ -type f -exec chmod 777 {} \;
    $root@vps:/home/git/libreERP-main# sudo find /home/git/repositories/ -type d -exec chmod 777 {} \;


Setup mySQL DB
------------------

    $ mysql -uadmin -p`cat /etc/psa/.psa.shadow`


    mysql>CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
    mysql>GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
    mysql>FLUSH PRIVILEGES;


    $ apt-get install libmysqlclient-dev
    $ pip install MySQL-python


  dont forget to apply all the migrations files after this.

Donation
------------------

If you feel that this project can be useful for you and want to sponsor few developments , please send your proposed module's details to  pkyisky@gmail.com .


I want to thank the following people for their kind support through sponsored development
------------------------------------------------------------------------------------------

1. Pravin Kumar (assignmenthouse.com)
2. Sagar Agarwal (goryd.in)


INSERT INTO `ERP_application` (id,created,name,icon,haveCss,haveJs,inMenu,description,module_id,canConfigure_id) VALUES (143,'2018-06-18 11:11:26.056790','app.configure.doctors','fa-users',0,1,1,'doctors master list',12,NULL);
