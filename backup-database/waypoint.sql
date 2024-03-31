PGDMP      2                |            ros-database    16.1    16.0     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16398    ros-database    DATABASE     �   CREATE DATABASE "ros-database" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "ros-database";
                postgres    false            �            1259    16442 	   waypoints    TABLE     �   CREATE TABLE public.waypoints (
    id integer NOT NULL,
    x double precision,
    y double precision,
    w double precision
);
    DROP TABLE public.waypoints;
       public         heap    postgres    false            �            1259    16441    waypoints_id_seq    SEQUENCE     �   CREATE SEQUENCE public.waypoints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.waypoints_id_seq;
       public          postgres    false    218            �           0    0    waypoints_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.waypoints_id_seq OWNED BY public.waypoints.id;
          public          postgres    false    217            +           2604    16445    waypoints id    DEFAULT     l   ALTER TABLE ONLY public.waypoints ALTER COLUMN id SET DEFAULT nextval('public.waypoints_id_seq'::regclass);
 ;   ALTER TABLE public.waypoints ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218            �          0    16442 	   waypoints 
   TABLE DATA           0   COPY public.waypoints (id, x, y, w) FROM stdin;
    public          postgres    false    218   �
       �           0    0    waypoints_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.waypoints_id_seq', 5, true);
          public          postgres    false    217            -           2606    16447    waypoints waypoints_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.waypoints
    ADD CONSTRAINT waypoints_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.waypoints DROP CONSTRAINT waypoints_pkey;
       public            postgres    false    218            �   P   x����0�ް>L)�t�9J���'Q��s�悧��F�N�����~-V��&Z�>�A�m�v(���L
kԣ/T����     