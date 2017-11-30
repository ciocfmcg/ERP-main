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

PART_TYPE_CHOICES = (
    ('text' , 'text'),
    ('image' , 'image'),
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
    subject = models.ForeignKey(Subject , null = False)
    title = models.CharField(max_length = 30 , null = False)
    description = models.TextField(max_length=2000 , null = False)


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
    forReview = models.BooleanField(default = False)
    reviewed = models.BooleanField(default = False)
    approved = models.BooleanField(default = False)
    archived = models.BooleanField(default = False)
    topic = models.ForeignKey(Topic , null = True , related_name='questions')
    level = models.PositiveIntegerField(null=True)
    marks = models.PositiveIntegerField(null=True)
    qtype = models.CharField(choices = QUESTION_TYPE_CHOICES , default = 'mcq' , null = False, max_length = 10)
    codeLang = models.CharField(choices = LANGUAGE_CHOICES , default = 'any' , null = False, max_length = 10)
    user = models.ForeignKey(User , null = False , related_name='questionsAuthored')

class Paper(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    level = models.PositiveIntegerField(null=True)
    questions = models.ManyToManyField(Question , blank = True)
    active = models.BooleanField(default = False)
    topic = models.ForeignKey(Topic , null = True , related_name='papers')
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
    ('pdf' , 'pdf'),
    ('presentation' , 'presentation'),
    ('word' , 'word'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('code' , 'code'),
    ('zip' , 'zip'),
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
    couse = models.ForeignKey(Course , null = False , related_name='enrollments')
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
    course = models.ForeignKey(Course , null = False)
    pinned = models.BooleanField(default = False)
    user = models.ForeignKey(User , null = False)


class Comment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    txt = models.CharField(max_length = 500 , null = False)
    user = models.ForeignKey(User , related_name='lmsMaterialComments' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='comments' , null = False)


class Like(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User , related_name='lmsMaterialLikes' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='likes' , null = False)
