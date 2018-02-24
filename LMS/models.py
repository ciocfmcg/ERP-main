from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from time import time

# Create your models here.
def getQAttachmentPath(instance , filename ):
    return 'lms/questions/%s_%s' % (str(time()).replace('.', '_'), filename)

def getStudyMaterialAttachmentPath(instance , filename ):
    return 'lms/studyMaterial/%s_%s' % (str(time()).replace('.', '_'), filename)

def getAnswerAttachmentPath(instance , filename ):
    return 'lms/answers/%s_%s' % (str(time()).replace('.', '_'), filename)

def getCourseDPAttachmentPath(instance , filename ):
    return 'lms/DP/%s_%s' % (str(time()).replace('.', '_'), filename)

def getVideoPath(instance , filename ):
    return 'lms/videos/%s_%s' % (str(time()).replace('.', '_'), filename)


def getVideoThumbnailPath(instance , filename ):
    return 'lms/videoThumbnail/%s_%s' % (str(time()).replace('.', '_'), filename)

def getChannelDPPath(instance , filename ):
    return 'lms/courseDP/%s_%s' % (str(time()).replace('.', '_'), filename)



PART_TYPE_CHOICES = (
    ('text' , 'text'),
    ('image' , 'image'),
)

LANGUAGE_CHOICES = (
    ("python", "Python"),
    ("bash", "Bash"),
    ("c", "C Language"),
    ("cpp", "C++ Language"),
    ("java", "Java Language"),
    ("scilab", "Scilab"),
    ("any", "any"),
)

class Subject(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 30 , null = False)
    level = models.PositiveIntegerField(null=True) # class
    description = models.TextField(max_length=2000 , null = False)
    dp = models.FileField(upload_to = getCourseDPAttachmentPath , null = True)


class Topic(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    subject = models.ForeignKey(Subject , null = False , related_name='topics')
    title = models.CharField(max_length = 30 , null = False)
    description = models.TextField(max_length=2000 , null = False)



QUESTION_LEVEL_CHOICES = (
    ("easy", "easy"),
    ("moderate", "moderate"),
    ("difficult", "difficult"),
)

QUESTION_STATUS_CHOICES = (
    ('submitted' , 'submitted'),
    ('reviewed' , 'reviewed'),
    ('approved' , 'approved'),
)


QUESTION_TYPE_CHOICES = (
    ("mcq", "Single Correct Choice"),
    ("mcc", "Multiple Correct Choices"),
    ("code", "Code"),
    ("upload", "Assignment Upload"),
    ("integer", "Answer in Integer"),
    ("string", "Answer in String"),
    ("float", "Answer in Float"),
)


class QPart(models.Model):
    mode = models.CharField(choices = PART_TYPE_CHOICES , default = 'text' , null = False, max_length = 10)
    txt = models.CharField(max_length = 2000 , null = True)
    image = models.FileField(upload_to = getQAttachmentPath , null = True)


class Question(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    ques = models.CharField(max_length = 5000 , null = False)
    quesParts = models.ManyToManyField(QPart , related_name='questions' , blank = True)
    optionsParts = models.ManyToManyField(QPart , related_name='questionsOptions' , blank = True)
    solutionParts = models.ManyToManyField(QPart , related_name='questionsSolutions' , blank = True)
    status = models.CharField(choices = QUESTION_STATUS_CHOICES , default = 'submitted' , max_length = 20)
    archived = models.BooleanField(default = False)
    topic = models.ForeignKey(Topic , null = True , related_name='questions')
    level = models.CharField(null=True , choices= QUESTION_LEVEL_CHOICES , max_length = 15)
    marks = models.PositiveIntegerField(null=True)
    qtype = models.CharField(choices = QUESTION_TYPE_CHOICES , default = 'mcq' , null = False, max_length = 10)
    codeLang = models.CharField(choices = LANGUAGE_CHOICES , default = 'any' , null = False, max_length = 10)
    user = models.ForeignKey(User , null = False , related_name='questionsAuthored')

class PaperQues(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User , null = False , related_name='paperQuesAuthored')
    ques=models.ForeignKey(Question,null=True,related_name="paperquestion")
    marks=models.PositiveSmallIntegerField(null=False)
    optional=models.BooleanField(default=False)
    negativeMarks=models.FloatField(null=False)

class Paper(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    questions = models.ManyToManyField(PaperQues , blank = True)
    active = models.BooleanField(default = False)
    user = models.ForeignKey(User , null = False , related_name='papersAuthored')

CORRECTION_CHOICES = (
    ('yes' , 'yes'),
    ('no' , 'no'),
    ('partial' , 'partial'),
)

class Answer(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    question = models.ForeignKey(Question , null = False , related_name='answersSubmssions')
    paper = models.ForeignKey(Paper , null = False , related_name='answersSubmssions')
    user = models.ForeignKey(User , null = False , related_name='answersSubmssions')
    evaluated = models.BooleanField(default = False)
    correct = models.CharField(choices = CORRECTION_CHOICES , default = 'no' , max_length = 10)
    marksObtained = models.PositiveIntegerField(default= 0)
    attachment = models.FileField(upload_to = getAnswerAttachmentPath , null = True)
    txt = models.TextField(max_length=10000 , null = True)

STUDY_MATERIAL_TYPE = (
    ('file' , 'file'),
    ('presentation' , 'presentation'),
    ('video' , 'video'),
    ('quiz' , 'quiz'),
    ('notes' , 'notes'),
    ('announcement' , 'announcement'),
)

ENROLLMENT_STATUS_CHOICES = (
    ('open' , 'open'),
    ('onInvitation' , 'onInvitation'),
    ('admin' , 'admin'),
    ('onRequest' , 'onRequest'),
    ('closed' , 'closed'),
)

class Course(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 100 , null = False)
    topic = models.ForeignKey(Topic , null = False)
    enrollmentStatus = models.CharField(choices = ENROLLMENT_STATUS_CHOICES , max_length = 20 , default = 'pdf')
    instructor = models.ForeignKey(User , related_name='lmsCoursesInstructing' , null = True)
    TAs = models.ManyToManyField(User , related_name='lmsCourseAssisting' , blank = True)
    user = models.ForeignKey(User , related_name='courseCreated' , null = False)
    description = models.TextField(max_length=2000 , null = False)
    dp = models.FileField(upload_to = getCourseDPAttachmentPath , null = True)

class Enrollment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    course = models.ForeignKey(Course , null = False , related_name='enrollments')
    addedBy = models.ForeignKey(User , related_name='lmsUsersAdded')
    accepted = models.BooleanField(default = True)
    user = models.ForeignKey(User , null = False)
    active = models.BooleanField(default = True)


class StudyMaterial(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    typ = models.CharField(choices = STUDY_MATERIAL_TYPE , max_length = 20 , default = 'pdf')
    attachment = models.FileField(upload_to = getStudyMaterialAttachmentPath , null = True)
    archived = models.BooleanField(default = False)
    course = models.ForeignKey(Course , null = False , related_name='studyMaterials')
    pinned = models.BooleanField(default = False)
    user = models.ForeignKey(User , null = False)
    data = models.CharField(max_length = 100 , null = True)


class Comment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    txt = models.CharField(max_length = 500 , null = False)
    user = models.ForeignKey(User , related_name='lmsMaterialComments' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='comments' , null = False)


class Like(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User , related_name='lmsMaterialLikes' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='likes' , null = False)


TYP_CHOICES = (
    ('comment','comment'),
    ('like','like'),
)



class Channel(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User ,null = False , related_name ="lmsChannels")
    title = models.CharField(max_length = 100 , null = False)
    description = models.CharField(max_length = 20000 , null = False)
    dp = models.ImageField(upload_to = getChannelDPPath , null = True)
    version =  models.CharField(max_length = 100 , null = False)


class Video(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User ,null = False , related_name ="videoUploads")
    title = models.CharField(max_length = 100 , null = False)
    description = models.CharField(max_length = 100 , null = False)
    # feedbacks = models.ManyToManyField(Feedback ,blank = True)
    views = models.PositiveIntegerField(default = 0)
    attachment = models.FileField(upload_to = getVideoPath , null = True)
    thumbnail = models.ImageField(upload_to = getVideoThumbnailPath , null = True)
    channel = models.ForeignKey(Channel , null = True , related_name ="videos")


class Feedback(models.Model):
    typ = models.CharField(choices = TYP_CHOICES , max_length = 10 , null = True)
    user = models.ForeignKey(User ,null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    comment = models.CharField(null = True , max_length = 1000)
    video = models.ForeignKey(Video , null = True , related_name="feedbacks")
    videoSeries = models.ForeignKey(Channel , null = True , related_name="feedbacks")

    class Meta:
        unique_together = ('user', 'video', 'typ')
