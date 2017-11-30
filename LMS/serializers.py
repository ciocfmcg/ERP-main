from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
import random, string



class QPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = QPart
        fields = ('pk' , 'mode' , 'txt', 'image' )



class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('pk' , 'created' , 'title', 'level' , 'description' , 'dp')


class TopicSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(many = False , read_only = True)
    class Meta:
        model = Topic
        fields = ('pk' , 'created' , 'subject', 'title' , 'description' )

    def create(self , validated_data):
        print 'came here'
        print self.context['request'].data['subject']
        t = Topic(**validated_data)
        t.subject = Subject.objects.get(pk = self.context['request'].data['subject'])
        t.save()
        return t


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('pk' , 'created' , 'updated', 'ques' , 'quesParts' , 'optionsParts' , 'solutionParts' , 'forReview', 'reviewed' , 'approved' , 'archived' , 'topic', 'level' , 'marks' , 'qtype' , 'codeLang' , 'user')
        read_only_fields = ('archived', 'approved', 'reviewed', 'forReview' , 'user')

class PaperSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many = True , read_only = True)
    class Meta:
        model = Paper
        fields = ('pk' , 'created' , 'updated', 'level', 'questions', 'active' , 'topic' , 'user')
        read_only_fields = ('user', )


class AnswerSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(many = False , read_only = True)
    class Meta:
        model = Answer
        fields = ('pk' , 'created' , 'question', 'paper' , 'evaluated' , 'correct', 'marksObtained' , 'attachment', 'txt' , 'subject')
        read_only_fields = ('user', )

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('pk' , 'created' , 'updated', 'topic', 'enrollmentStatus', 'instructor' , 'TAs' , 'user' , 'description')
        read_only_fields = ('user', )

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ('pk' , 'created' , 'couse', 'addedBy', 'accepted', 'user' , 'active' )
        read_only_fields = ('user', )

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('pk' , 'created' , 'txt', 'user')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('pk' , 'created' , 'user' )

class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = ('pk' , 'created' , 'typ', 'attachment', 'archived', 'course' , 'pinned' , 'likes'  , 'comments')
